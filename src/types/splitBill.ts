/**
 * Split Bill Feature Type Definitions
 */

// ============================================
// DATABASE TYPES (mirrors Supabase schema)
// ============================================

export type SplitBillStatus = 'active' | 'settled' | 'archived';

export interface SplitBill {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  tipAmount: number;
  totalAmount: number;
  receiptImageUrl?: string;
  date: string;
  status: SplitBillStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  billId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BillParticipant {
  id: string;
  billId: string;
  name: string;
  subtotal: number;
  taxShare: number;
  serviceShare: number;
  tipShare: number;
  totalAmount: number;
  isSettled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillItemAssignment {
  id: string;
  itemId: string;
  participantId: string;
  sharePercentage: number;
  shareAmount: number;
  createdAt: string;
}

// ============================================
// AI EXTRACTION TYPES
// ============================================

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractedLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  confidence: ConfidenceLevel;
}

export interface ExtractedReceiptData {
  title: string;
  items: ExtractedLineItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  tipAmount: number;
  totalAmount: number;
  confidence: ConfidenceLevel;
}

export interface ReceiptExtractionResult {
  success: boolean;
  data?: ExtractedReceiptData;
  error?: string;
  imageUri?: string;
}

// ============================================
// WIZARD STATE TYPES
// ============================================

export type WizardStep = 'scan' | 'validate' | 'assign' | 'review';

export interface EditableBillItem {
  tempId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isEdited: boolean;
  confidence?: ConfidenceLevel;
}

export interface EditableParticipant {
  tempId: string;
  name: string;
}

export interface BillExtras {
  taxAmount: number;
  serviceCharge: number;
  tipAmount: number;
}

export interface SplitBillWizardState {
  step: WizardStep;
  title: string;
  imageUri?: string;
  extractedData?: ExtractedReceiptData;
  editedItems: EditableBillItem[];
  participants: EditableParticipant[];
  assignments: Record<string, string[]>; // itemTempId -> participantTempIds[]
  extras: BillExtras;
}

// ============================================
// SUMMARY & DISPLAY TYPES
// ============================================

export interface ItemBreakdown {
  item: EditableBillItem;
  shareAmount: number;
  sharePercentage: number;
}

export interface ParticipantSummary {
  participant: EditableParticipant;
  itemsSubtotal: number;
  taxShare: number;
  serviceShare: number;
  tipShare: number;
  totalAmount: number;
  itemBreakdown: ItemBreakdown[];
}

// ============================================
// FULL BILL DETAILS (for viewing saved bills)
// ============================================

export interface SplitBillWithDetails {
  bill: SplitBill;
  participants: BillParticipant[];
  items: BillItem[];
  assignments: BillItemAssignment[];
}

// ============================================
// SERVICE INPUT TYPES
// ============================================

export interface CreateSplitBillInput {
  title: string;
  description?: string;
  items: EditableBillItem[];
  participants: EditableParticipant[];
  assignments: Record<string, string[]>;
  extras: BillExtras;
  receiptImageUrl?: string;
}

export interface UpdateSplitBillInput {
  title?: string;
  description?: string;
  status?: SplitBillStatus;
}
