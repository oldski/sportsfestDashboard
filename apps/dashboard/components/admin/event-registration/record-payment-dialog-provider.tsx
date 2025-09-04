'use client';

import * as React from 'react';

interface RecordPaymentDialogContextValue {
  isOpen: boolean;
  invoiceId: string | null;
  openDialog: (invoiceId: string) => void;
  closeDialog: () => void;
}

const RecordPaymentDialogContext = React.createContext<RecordPaymentDialogContextValue | null>(null);

export function RecordPaymentDialogProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);
  const [invoiceId, setInvoiceId] = React.useState<string | null>(null);

  const openDialog = React.useCallback((id: string) => {
    setInvoiceId(id);
    setIsOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsOpen(false);
    setInvoiceId(null);
  }, []);

  const value = React.useMemo(() => ({
    isOpen,
    invoiceId,
    openDialog,
    closeDialog,
  }), [isOpen, invoiceId, openDialog, closeDialog]);

  return (
    <RecordPaymentDialogContext.Provider value={value}>
      {children}
    </RecordPaymentDialogContext.Provider>
  );
}

export function useRecordPaymentDialog(): RecordPaymentDialogContextValue {
  const context = React.useContext(RecordPaymentDialogContext);
  if (!context) {
    throw new Error('useRecordPaymentDialog must be used within a RecordPaymentDialogProvider');
  }
  return context;
}