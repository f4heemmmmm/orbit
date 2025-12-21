/**
 * Custom hook for receipt scanning functionality
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import type { TransactionInitialData } from '../components/AddTransactionModal';
import { scanReceipt } from '../services/receiptService';

export interface UseReceiptScannerReturn {
  scanning: boolean;
  scanOptionsVisible: boolean;
  initialTransactionData: TransactionInitialData | undefined;
  openScanOptions: () => void;
  closeScanOptions: () => void;
  handleScanReceipt: (useCamera: boolean, onSuccess: () => void) => Promise<void>;
  clearInitialData: () => void;
  setInitialTransactionData: (data: TransactionInitialData | undefined) => void;
}

export function useReceiptScanner(): UseReceiptScannerReturn {
  const [scanning, setScanning] = useState(false);
  const [scanOptionsVisible, setScanOptionsVisible] = useState(false);
  const [initialTransactionData, setInitialTransactionData] = useState<
    TransactionInitialData | undefined
  >(undefined);

  const openScanOptions = useCallback(() => {
    setScanOptionsVisible(true);
  }, []);

  const closeScanOptions = useCallback(() => {
    setScanOptionsVisible(false);
  }, []);

  const clearInitialData = useCallback(() => {
    setInitialTransactionData(undefined);
  }, []);

  const handleScanReceipt = useCallback(
    async (useCamera: boolean, onSuccess: () => void): Promise<void> => {
      setScanOptionsVisible(false);
      setScanning(true);

      try {
        const result = await scanReceipt(useCamera);

        if (!result.success) {
          setScanning(false);
          if (result.error) {
            Alert.alert('Scan Failed', result.error);
          }
          return;
        }

        if (result.data) {
          // Pre-fill the transaction modal with scanned data
          setInitialTransactionData({
            title: result.data.title,
            description: result.data.description,
            amount: result.data.amount,
            type: result.data.type,
            category: result.data.category,
          });

          setScanning(false);

          // Show confidence level to user
          const confidenceMessage =
            result.data.confidence === 'high'
              ? 'Receipt scanned successfully!'
              : result.data.confidence === 'medium'
                ? 'Receipt scanned. Please verify the details.'
                : 'Some details may be inaccurate. Please review carefully.';

          Alert.alert('Receipt Scanned', confidenceMessage, [
            {
              text: 'Review & Add',
              onPress: onSuccess,
            },
          ]);
        }
      } catch {
        setScanning(false);
        Alert.alert('Error', 'An unexpected error occurred while scanning the receipt.');
      }
    },
    []
  );

  return {
    scanning,
    scanOptionsVisible,
    initialTransactionData,
    openScanOptions,
    closeScanOptions,
    handleScanReceipt,
    clearInitialData,
    setInitialTransactionData,
  };
}
