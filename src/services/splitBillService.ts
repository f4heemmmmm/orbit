/**
 * Split Bill Service
 * Handles all split bill database operations
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type {
  SplitBill,
  BillParticipant,
  BillItem,
  BillItemAssignment,
  SplitBillWithDetails,
  CreateSplitBillInput,
  EditableBillItem,
  EditableParticipant,
  BillExtras,
  ParticipantSummary,
  ItemBreakdown,
} from '../types/splitBill';

type SplitBillRow = Database['public']['Tables']['split_bills']['Row'];
type BillItemRow = Database['public']['Tables']['bill_items']['Row'];
type BillParticipantRow = Database['public']['Tables']['bill_participants']['Row'];
type BillItemAssignmentRow = Database['public']['Tables']['bill_item_assignments']['Row'];

// ============================================
// AUTH HELPER
// ============================================

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

// ============================================
// MAPPERS
// ============================================

function mapRowToSplitBill(row: SplitBillRow): SplitBill {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || undefined,
    subtotal: Number(row.subtotal),
    taxAmount: Number(row.tax_amount),
    serviceCharge: Number(row.service_charge),
    tipAmount: Number(row.tip_amount),
    totalAmount: Number(row.total_amount),
    receiptImageUrl: row.receipt_image_url || undefined,
    date: row.date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToItem(row: BillItemRow): BillItem {
  return {
    id: row.id,
    billId: row.bill_id,
    name: row.name,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    totalPrice: Number(row.total_price),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToParticipant(row: BillParticipantRow): BillParticipant {
  return {
    id: row.id,
    billId: row.bill_id,
    name: row.name,
    subtotal: Number(row.subtotal),
    taxShare: Number(row.tax_share),
    serviceShare: Number(row.service_share),
    tipShare: Number(row.tip_share),
    totalAmount: Number(row.total_amount),
    isSettled: row.is_settled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToAssignment(row: BillItemAssignmentRow): BillItemAssignment {
  return {
    id: row.id,
    itemId: row.item_id,
    participantId: row.participant_id,
    sharePercentage: Number(row.share_percentage),
    shareAmount: Number(row.share_amount),
    createdAt: row.created_at,
  };
}

// ============================================
// SPLIT BILLS CRUD
// ============================================

/**
 * Get all split bills for the current user
 */
export async function getSplitBills(): Promise<SplitBill[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('No user logged in');
  }

  const { data, error } = await supabase
    .from('split_bills')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }
  return (data || []).map(mapRowToSplitBill);
}

/**
 * Get a single split bill with all related data
 */
export async function getSplitBillWithDetails(
  billId: string
): Promise<SplitBillWithDetails | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('No user logged in');
  }

  // Fetch bill
  const { data: billData, error: billError } = await supabase
    .from('split_bills')
    .select('*')
    .eq('id', billId)
    .eq('user_id', userId)
    .single();

  if (billError || !billData) {
    return null;
  }

  // Fetch participants and items in parallel
  const [participantsResult, itemsResult] = await Promise.all([
    supabase.from('bill_participants').select('*').eq('bill_id', billId),
    supabase.from('bill_items').select('*').eq('bill_id', billId).order('sort_order'),
  ]);

  const items = (itemsResult.data || []).map(mapRowToItem);
  const participants = (participantsResult.data || []).map(mapRowToParticipant);

  // Fetch assignments for all items
  const itemIds = items.map(i => i.id);
  const { data: assignmentsData } =
    itemIds.length > 0
      ? await supabase.from('bill_item_assignments').select('*').in('item_id', itemIds)
      : { data: [] };

  return {
    bill: mapRowToSplitBill(billData),
    participants,
    items,
    assignments: (assignmentsData || []).map(mapRowToAssignment),
  };
}

/**
 * Create a complete split bill with items, participants, and assignments
 */
export async function createSplitBill(input: CreateSplitBillInput): Promise<SplitBill | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('No user logged in');
  }

  const { title, description, items, participants, assignments, extras, receiptImageUrl } = input;

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = subtotal + extras.taxAmount + extras.serviceCharge + extras.tipAmount;

  try {
    // 1. Create the bill
    const { data: billData, error: billError } = await supabase
      .from('split_bills')
      .insert({
        user_id: userId,
        title,
        description: description || null,
        subtotal,
        tax_amount: extras.taxAmount,
        service_charge: extras.serviceCharge,
        tip_amount: extras.tipAmount,
        total_amount: totalAmount,
        receipt_image_url: receiptImageUrl || null,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (billError || !billData) {
      console.error('Error creating split bill:', billError);
      return null;
    }

    const billId = billData.id;

    // 2. Create participants and map temp IDs to real IDs
    const participantIdMap = new Map<string, string>();
    for (const participant of participants) {
      const { data: pData } = await supabase
        .from('bill_participants')
        .insert({ bill_id: billId, name: participant.name })
        .select()
        .single();

      if (pData) {
        participantIdMap.set(participant.tempId, pData.id);
      }
    }

    // 3. Create items and map temp IDs to real IDs
    const itemIdMap = new Map<string, string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { data: iData } = await supabase
        .from('bill_items')
        .insert({
          bill_id: billId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          sort_order: i,
        })
        .select()
        .single();

      if (iData) {
        itemIdMap.set(item.tempId, iData.id);
      }
    }

    // 4. Create assignments
    for (const [itemTempId, participantTempIds] of Object.entries(assignments)) {
      const realItemId = itemIdMap.get(itemTempId);
      if (!realItemId) {
        continue;
      }

      const item = items.find(i => i.tempId === itemTempId);
      if (!item) {
        continue;
      }

      const sharePercentage = 100 / participantTempIds.length;
      const shareAmount = item.totalPrice / participantTempIds.length;

      for (const pTempId of participantTempIds) {
        const realParticipantId = participantIdMap.get(pTempId);
        if (!realParticipantId) {
          continue;
        }

        await supabase.from('bill_item_assignments').insert({
          item_id: realItemId,
          participant_id: realParticipantId,
          share_percentage: Math.round(sharePercentage * 100) / 100,
          share_amount: Math.round(shareAmount * 100) / 100,
        });
      }
    }

    // 5. Calculate and update participant totals
    await updateParticipantTotals(billId, subtotal, extras);

    // 6. Update recent participants for autocomplete
    await updateRecentParticipants(
      userId,
      participants.map(p => p.name)
    );

    return mapRowToSplitBill(billData);
  } catch (error) {
    console.error('Error creating split bill:', error);
    return null;
  }
}

/**
 * Update participant totals with proportional tax/service/tip
 */
async function updateParticipantTotals(
  billId: string,
  subtotal: number,
  extras: BillExtras
): Promise<void> {
  // Get all participants for this bill
  const { data: participants } = await supabase
    .from('bill_participants')
    .select('id')
    .eq('bill_id', billId);

  if (!participants) {
    return;
  }

  for (const participant of participants) {
    // Sum assignments for this participant
    const { data: assignments } = await supabase
      .from('bill_item_assignments')
      .select('share_amount')
      .eq('participant_id', participant.id);

    const itemSubtotal = (assignments || []).reduce((sum, a) => sum + Number(a.share_amount), 0);
    const proportion = subtotal > 0 ? itemSubtotal / subtotal : 0;

    const taxShare = Math.round(extras.taxAmount * proportion * 100) / 100;
    const serviceShare = Math.round(extras.serviceCharge * proportion * 100) / 100;
    const tipShare = Math.round(extras.tipAmount * proportion * 100) / 100;
    const totalAmount = Math.round((itemSubtotal + taxShare + serviceShare + tipShare) * 100) / 100;

    await supabase
      .from('bill_participants')
      .update({
        subtotal: Math.round(itemSubtotal * 100) / 100,
        tax_share: taxShare,
        service_share: serviceShare,
        tip_share: tipShare,
        total_amount: totalAmount,
      })
      .eq('id', participant.id);
  }
}

/**
 * Delete a split bill
 */
export async function deleteSplitBill(billId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('No user logged in');
  }

  const { error } = await supabase
    .from('split_bills')
    .delete()
    .eq('id', billId)
    .eq('user_id', userId);

  return !error;
}

/**
 * Mark a bill as settled
 */
export async function settleSplitBill(billId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('No user logged in');
  }

  const { error } = await supabase
    .from('split_bills')
    .update({ status: 'settled' })
    .eq('id', billId)
    .eq('user_id', userId);

  return !error;
}

/**
 * Mark a participant as settled
 */
export async function settleParticipant(billId: string, participantId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('No user logged in');
  }

  // Verify bill belongs to user
  const { data: bill } = await supabase
    .from('split_bills')
    .select('id')
    .eq('id', billId)
    .eq('user_id', userId)
    .single();

  if (!bill) {
    return false;
  }

  const { error } = await supabase
    .from('bill_participants')
    .update({ is_settled: true })
    .eq('id', participantId)
    .eq('bill_id', billId);

  return !error;
}

/**
 * Mark a participant as not settled (uncheck paid)
 */
export async function unsettleParticipant(billId: string, participantId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('No user logged in');
  }

  // Verify bill belongs to user
  const { data: bill } = await supabase
    .from('split_bills')
    .select('id')
    .eq('id', billId)
    .eq('user_id', userId)
    .single();

  if (!bill) {
    return false;
  }

  const { error } = await supabase
    .from('bill_participants')
    .update({ is_settled: false })
    .eq('id', participantId)
    .eq('bill_id', billId);

  return !error;
}

// ============================================
// RECENT PARTICIPANTS
// ============================================

/**
 * Get recent participants for autocomplete
 */
export async function getRecentParticipants(): Promise<string[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const { data } = await supabase
    .from('recent_participants')
    .select('name')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false })
    .limit(20);

  return (data || []).map(p => p.name);
}

/**
 * Update recent participants list
 */
async function updateRecentParticipants(userId: string, names: string[]): Promise<void> {
  for (const name of names) {
    // Try to upsert - increment count if exists, create if not
    const { error } = await supabase.from('recent_participants').upsert(
      {
        user_id: userId,
        name,
        usage_count: 1,
        last_used_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,name',
        ignoreDuplicates: false,
      }
    );

    // If there was a conflict (duplicate), just update the last_used_at timestamp
    if (error?.code === '23505') {
      await supabase
        .from('recent_participants')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('name', name);
    }
  }
}

// ============================================
// CALCULATION UTILITIES
// ============================================

/**
 * Calculate summary for each participant
 * Used in the wizard before saving
 */
export function calculateParticipantSummaries(
  items: EditableBillItem[],
  participants: EditableParticipant[],
  assignments: Record<string, string[]>,
  extras: BillExtras
): ParticipantSummary[] {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return participants.map(participant => {
    // Find items assigned to this participant
    const itemBreakdown: ItemBreakdown[] = [];
    let itemsSubtotal = 0;

    for (const [itemId, participantIds] of Object.entries(assignments)) {
      if (participantIds.includes(participant.tempId)) {
        const item = items.find(i => i.tempId === itemId);
        if (item) {
          const sharePercentage = 100 / participantIds.length;
          const shareAmount = item.totalPrice / participantIds.length;
          itemBreakdown.push({
            item,
            shareAmount: Math.round(shareAmount * 100) / 100,
            sharePercentage: Math.round(sharePercentage * 100) / 100,
          });
          itemsSubtotal += shareAmount;
        }
      }
    }

    // Calculate proportional extras
    const proportion = subtotal > 0 ? itemsSubtotal / subtotal : 0;
    const taxShare = Math.round(extras.taxAmount * proportion * 100) / 100;
    const serviceShare = Math.round(extras.serviceCharge * proportion * 100) / 100;
    const tipShare = Math.round(extras.tipAmount * proportion * 100) / 100;
    const totalAmount =
      Math.round((itemsSubtotal + taxShare + serviceShare + tipShare) * 100) / 100;

    return {
      participant,
      itemsSubtotal: Math.round(itemsSubtotal * 100) / 100,
      taxShare,
      serviceShare,
      tipShare,
      totalAmount,
      itemBreakdown,
    };
  });
}

/**
 * Check if all items are assigned
 */
export function areAllItemsAssigned(
  items: EditableBillItem[],
  assignments: Record<string, string[]>
): boolean {
  return items.every(item => {
    const assigned = assignments[item.tempId];
    return assigned && assigned.length > 0;
  });
}

/**
 * Get unassigned items
 */
export function getUnassignedItems(
  items: EditableBillItem[],
  assignments: Record<string, string[]>
): EditableBillItem[] {
  return items.filter(item => {
    const assigned = assignments[item.tempId];
    return !assigned || assigned.length === 0;
  });
}
