/**
 * Split Bill Receipt Service
 * Handles receipt scanning with line-item extraction for bill splitting
 */

import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import type {
  ExtractedReceiptData,
  ReceiptExtractionResult,
  ExtractedLineItem,
  ConfidenceLevel,
} from '../types/splitBill';

// Re-export camera/gallery functions from existing service
export {
  captureReceiptImage,
  selectReceiptImage,
  requestCameraPermission,
  requestMediaLibraryPermission,
} from './receiptService';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Convert image URI to base64 string
 */
async function imageToBase64(uri: string): Promise<string> {
  const base64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  return base64;
}

/**
 * Normalize a number value (parse and round to 2 decimals)
 */
function normalizeNumber(value: unknown): number {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

/**
 * Normalize confidence level
 */
function normalizeConfidence(value: unknown): ConfidenceLevel {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }
  return 'medium';
}

/**
 * Normalize extracted line items
 */
function normalizeItems(items: unknown[]): ExtractedLineItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(item => {
    const obj = item as Record<string, unknown>;
    const quantity = Math.max(1, parseInt(String(obj.quantity)) || 1);
    const unitPrice = normalizeNumber(obj.unitPrice || obj.unit_price);
    const totalPrice = normalizeNumber(obj.totalPrice || obj.total_price);

    return {
      name: String(obj.name || 'Unknown Item').substring(0, 100),
      quantity,
      unitPrice: unitPrice || totalPrice / quantity,
      totalPrice: totalPrice || unitPrice * quantity,
      confidence: normalizeConfidence(obj.confidence),
    };
  });
}

/**
 * Process receipt image to extract line items using OpenAI Vision API
 */
export async function extractReceiptLineItems(imageUri: string): Promise<ReceiptExtractionResult> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    return {
      success: false,
      error: 'OpenAI API key not configured. Please add your API key to the .env file.',
      imageUri,
    };
  }

  try {
    const base64Image = await imageToBase64(imageUri);

    const prompt = `Analyze this receipt image and extract ALL individual line items with their prices.

IMPORTANT INSTRUCTIONS:
1. Extract EVERY item listed on the receipt, not just the total
2. For each item, identify: name, quantity (if shown), unit price, and total price for that item
3. Identify subtotal, tax, service charge, and tip separately from items
4. If quantity is not shown, assume 1
5. Be thorough - even if text is slightly blurry, try to read it
6. Generate a DESCRIPTIVE title for this bill

Return a JSON object with this EXACT structure:
{
  "title": "A descriptive name like 'Dinner at [Restaurant Name]', 'Lunch at [Cafe]', 'Groceries at [Store]', or if no merchant name visible, describe based on items like 'Pizza Dinner', 'Coffee Run', 'Grocery Shopping'",
  "items": [
    {
      "name": "Item name exactly as shown on receipt",
      "quantity": 1,
      "unitPrice": 12.99,
      "totalPrice": 12.99,
      "confidence": "high"
    }
  ],
  "subtotal": 45.97,
  "taxAmount": 4.60,
  "serviceCharge": 0,
  "tipAmount": 0,
  "totalAmount": 50.57,
  "confidence": "high"
}

RULES:
- "title" MUST be descriptive - use merchant name with context (e.g., "Dinner at Olive Garden") or describe the purchase type (e.g., "Thai Food", "Coffee & Snacks", "Grocery Trip")
- "confidence" for each item should be "high", "medium", or "low" based on readability
- Set item confidence to "low" if you had to guess the name or price
- Include ALL items even if hard to read (mark confidence accordingly)
- If no tax/service/tip visible, set to 0
- Prices must be numbers without currency symbols
- "subtotal" should be the sum of all item totalPrice values
- "totalAmount" should be subtotal + tax + service + tip
- Overall "confidence" should reflect the general receipt readability

If the receipt is completely unreadable, return:
{"error": "Unable to read receipt"}

Return ONLY the JSON object, no additional text or markdown.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      return {
        success: false,
        error: `API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
        imageUri,
      };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return {
        success: false,
        error: 'No response from AI',
        imageUri,
      };
    }

    // Parse JSON response
    let parsedData: Record<string, unknown>;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanContent) as Record<string, unknown>;
    } catch {
      return {
        success: false,
        error: 'Failed to parse AI response',
        imageUri,
      };
    }

    // Check if AI reported an error
    if (parsedData.error) {
      return {
        success: false,
        error: String(parsedData.error),
        imageUri,
      };
    }

    // Normalize extracted items
    const items = normalizeItems((parsedData.items as unknown[]) || []);

    // Calculate subtotal from items if not provided
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const subtotal = normalizeNumber(parsedData.subtotal) || calculatedSubtotal;

    const extractedData: ExtractedReceiptData = {
      title: String(parsedData.title || 'Receipt').substring(0, 100),
      items,
      subtotal,
      taxAmount: normalizeNumber(parsedData.taxAmount || parsedData.tax_amount),
      serviceCharge: normalizeNumber(parsedData.serviceCharge || parsedData.service_charge),
      tipAmount: normalizeNumber(parsedData.tipAmount || parsedData.tip_amount),
      totalAmount: normalizeNumber(parsedData.totalAmount || parsedData.total_amount),
      confidence: normalizeConfidence(parsedData.confidence),
    };

    // If totalAmount is 0 or missing, calculate it
    if (extractedData.totalAmount === 0) {
      extractedData.totalAmount =
        extractedData.subtotal +
        extractedData.taxAmount +
        extractedData.serviceCharge +
        extractedData.tipAmount;
    }

    // Validate we got at least some data
    if (items.length === 0 && extractedData.totalAmount === 0) {
      return {
        success: false,
        error: 'Could not extract any items or amounts from the receipt',
        imageUri,
      };
    }

    return {
      success: true,
      data: extractedData,
      imageUri,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      imageUri,
    };
  }
}

/**
 * Combined function to capture/select and extract receipt data
 */
export async function scanReceiptForSplit(
  useCamera: boolean = true
): Promise<ReceiptExtractionResult> {
  const { captureReceiptImage, selectReceiptImage } = await import('./receiptService');

  const imageUri = useCamera ? await captureReceiptImage() : await selectReceiptImage();

  if (!imageUri) {
    return {
      success: false,
      error: useCamera ? 'Camera access denied or cancelled' : 'Gallery access denied or cancelled',
    };
  }

  return extractReceiptLineItems(imageUri);
}
