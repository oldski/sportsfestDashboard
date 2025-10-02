'use client';

import * as React from 'react';

type CreateCouponDialogContextType = {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  editingCoupon: string | null;
  setEditingCoupon: (couponId: string | null) => void;
  onDataChange: React.MutableRefObject<(() => void) | null>;
};

const CreateCouponDialogContext = React.createContext<CreateCouponDialogContextType | null>(null);

export function CreateCouponDialogProvider({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<string | null>(null);
  const onDataChangeRef = React.useRef<(() => void) | null>(null);

  const openDialog = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsOpen(false);
    setEditingCoupon(null);
    // Small delay to allow form to reset after dialog closes
    setTimeout(() => {
      // This gives the form time to reset properly
    }, 100);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      isOpen,
      openDialog,
      closeDialog,
      editingCoupon,
      setEditingCoupon,
      onDataChange: onDataChangeRef
    }),
    [isOpen, openDialog, closeDialog, editingCoupon]
  );

  return (
    <CreateCouponDialogContext.Provider value={contextValue}>
      {children}
    </CreateCouponDialogContext.Provider>
  );
}

export function useCreateCouponDialog(): CreateCouponDialogContextType {
  const context = React.useContext(CreateCouponDialogContext);
  if (!context) {
    throw new Error('useCreateCouponDialog must be used within a CreateCouponDialogProvider');
  }
  return context;
}