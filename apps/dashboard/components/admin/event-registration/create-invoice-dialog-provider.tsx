'use client';

import * as React from 'react';

interface CreateInvoiceDialogContextValue {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

const CreateInvoiceDialogContext = React.createContext<CreateInvoiceDialogContextValue | null>(null);

export function CreateInvoiceDialogProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);

  const openDialog = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = React.useMemo(() => ({
    isOpen,
    openDialog,
    closeDialog,
  }), [isOpen, openDialog, closeDialog]);

  return (
    <CreateInvoiceDialogContext.Provider value={value}>
      {children}
    </CreateInvoiceDialogContext.Provider>
  );
}

export function useCreateInvoiceDialog(): CreateInvoiceDialogContextValue {
  const context = React.useContext(CreateInvoiceDialogContext);
  if (!context) {
    throw new Error('useCreateInvoiceDialog must be used within a CreateInvoiceDialogProvider');
  }
  return context;
}