/**
 * Receipt Service
 * Handles camera capture and OCR processing of receipts using OpenAI Vision API
 */

import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import type { TransactionCategory } from '../types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ReceiptData {
  title: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  type: 'expense' | 'income';
  confidence: 'high' | 'medium' | 'low';
}

export interface ReceiptScanResult {
  success: boolean;
  data?: ReceiptData;
  error?: string;
  imageUri?: string;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Launch camera to capture receipt image
 */
export async function captureReceiptImage(): Promise<string | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Select receipt image from gallery
 */
export async function selectReceiptImage(): Promise<string | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

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
 * Determine category based on AI analysis
 */
function mapToCategory(category: string): TransactionCategory {
  const categoryMap: Record<string, TransactionCategory> = {
    food: 'Food',
    restaurant: 'Food',
    dining: 'Food',
    grocery: 'Food',
    groceries: 'Food',
    supermarket: 'Food',
    cafe: 'Food',
    coffee: 'Food',
    transport: 'Transport',
    transportation: 'Transport',
    gas: 'Transport',
    fuel: 'Transport',
    uber: 'Transport',
    taxi: 'Transport',
    parking: 'Transport',
    bills: 'Bills',
    utility: 'Bills',
    utilities: 'Bills',
    electricity: 'Bills',
    water: 'Bills',
    internet: 'Bills',
    phone: 'Bills',
    subscription: 'Bills',
    shopping: 'Shopping',
    retail: 'Shopping',
    clothing: 'Shopping',
    clothes: 'Shopping',
    electronics: 'Shopping',
    amazon: 'Shopping',
    entertainment: 'Entertainment',
    movie: 'Entertainment',
    cinema: 'Entertainment',
    games: 'Entertainment',
    streaming: 'Entertainment',
    health: 'Health',
    medical: 'Health',
    pharmacy: 'Health',
    medicine: 'Health',
    doctor: 'Health',
    hospital: 'Health',
    clinic: 'Health',
    salary: 'Salary',
    income: 'Salary',
    payment: 'Salary',
    wages: 'Salary',
  };

  const normalizedCategory = category.toLowerCase().trim();
  return categoryMap[normalizedCategory] || 'Other';
}

/**
 * Process receipt image using OpenAI Vision API
 */
export async function processReceiptImage(imageUri: string): Promise<ReceiptScanResult> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    return {
      success: false,
      error: 'OpenAI API key not configured. Please add your API key to the .env file.',
      imageUri,
    };
  }

  try {
    // Convert image to base64
    const base64Image = await imageToBase64(imageUri);

    const prompt = `Analyze this receipt image and extract the following information. Be thorough and try your best to understand the content even if the image quality is not perfect.

IMPORTANT: Always extract the TOTAL amount (the final amount paid). Look for words like "Total", "Grand Total", "Amount Due", "Balance", etc.

Please respond with a JSON object containing:
{
  "title": "A short, descriptive title for this transaction (e.g., 'Grocery Shopping', 'Lunch at Restaurant', 'Gas Station')",
  "description": "Brief description of items purchased or service rendered (max 100 characters)",
  "amount": <number - the total amount as a decimal number, e.g., 25.99>,
  "category": "<one of: Food, Transport, Bills, Shopping, Entertainment, Health, Other>",
  "type": "<expense or income - receipts are usually expense>",
  "confidence": "<high, medium, or low - based on how clearly you could read the receipt>"
}

If you cannot read the receipt at all, still try to extract any visible numbers as the amount and use "Other" as category.
If absolutely nothing is readable, return: {"error": "Unable to read receipt"}

Return ONLY the JSON object, no additional text.`;

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
              {
                type: 'text',
                text: prompt,
              },
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
        max_tokens: 500,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
        imageUri,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return {
        success: false,
        error: 'No response from AI',
        imageUri,
      };
    }

    // Parse the JSON response
    let parsedData;
    try {
      // Handle potential markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanContent);
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
        error: parsedData.error,
        imageUri,
      };
    }

    // Validate and normalize the data
    const amount =
      typeof parsedData.amount === 'number'
        ? parsedData.amount
        : parseFloat(parsedData.amount) || 0;

    if (amount <= 0) {
      return {
        success: false,
        error: 'Could not extract a valid amount from the receipt',
        imageUri,
      };
    }

    const receiptData: ReceiptData = {
      title: parsedData.title || 'Receipt Transaction',
      description: parsedData.description || '',
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      category: mapToCategory(parsedData.category || 'Other'),
      type: parsedData.type === 'income' ? 'income' : 'expense',
      confidence: ['high', 'medium', 'low'].includes(parsedData.confidence)
        ? parsedData.confidence
        : 'medium',
    };

    return {
      success: true,
      data: receiptData,
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
 * Combined function to capture and process a receipt
 */
export async function scanReceipt(useCamera: boolean = true): Promise<ReceiptScanResult> {
  const imageUri = useCamera ? await captureReceiptImage() : await selectReceiptImage();

  if (!imageUri) {
    return {
      success: false,
      error: useCamera ? 'Camera access denied or cancelled' : 'Gallery access denied or cancelled',
    };
  }

  return processReceiptImage(imageUri);
}
