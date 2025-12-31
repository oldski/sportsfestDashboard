'use client';

import * as React from 'react';

interface CreateSponsorshipDialogContextValue {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  onSuccess: React.MutableRefObject<(() => void) | null>;
}

const CreateSponsorshipDialogContext = React.createContext<CreateSponsorshipDialogContextValue | null>(null);

export function CreateSponsorshipDialogProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);
  const onSuccess = React.useRef<(() => void) | null>(null);

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
    onSuccess,
  }), [isOpen, openDialog, closeDialog]);

  return (
    <CreateSponsorshipDialogContext.Provider value={value}>
      {children}
    </CreateSponsorshipDialogContext.Provider>
  );
}

export function useCreateSponsorshipDialog(): CreateSponsorshipDialogContextValue {
  const context = React.useContext(CreateSponsorshipDialogContext);
  if (!context) {
    throw new Error('useCreateSponsorshipDialog must be used within a CreateSponsorshipDialogProvider');
  }
  return context;
}
