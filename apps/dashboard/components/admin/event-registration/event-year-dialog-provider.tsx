'use client';

import * as React from 'react';
import { EventYearDialog } from '~/components/admin/event-registration/event-year-dialog';
import { DeleteEventYearDialog } from '~/components/admin/event-registration/delete-event-year-dialog';
import { useRouter } from 'next/navigation';
import type { EventYearWithStats } from '~/actions/admin/get-event-years';

interface EventYearDialogContextType {
  openCreateDialog: () => void;
  openEditDialog: (eventYearId: string) => void;
  openDeleteDialog: (eventYear: EventYearWithStats) => void;
}

const EventYearDialogContext = React.createContext<EventYearDialogContextType | null>(null);

export function useEventYearDialog() {
  const context = React.useContext(EventYearDialogContext);
  if (!context) {
    throw new Error('useEventYearDialog must be used within EventYearDialogProvider');
  }
  return context;
}

interface EventYearDialogProviderProps {
  children: React.ReactNode;
}

export function EventYearDialogProvider({ children }: EventYearDialogProviderProps): React.JSX.Element {
  const router = useRouter();
  
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedEventYear, setSelectedEventYear] = React.useState<any>(null);

  const openCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const openEditDialog = async (eventYearId: string) => {
    try {
      const { getEventYear } = await import('~/actions/admin/get-event-year');
      const fullEventYear = await getEventYear(eventYearId);
      if (fullEventYear) {
        setSelectedEventYear(fullEventYear);
        setEditDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching event year for edit:', error);
    }
  };

  const openDeleteDialog = (eventYear: EventYearWithStats) => {
    setSelectedEventYear(eventYear);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    router.refresh();
  };

  return (
    <EventYearDialogContext.Provider value={{ openCreateDialog, openEditDialog, openDeleteDialog }}>
      {children}
      
      {/* Dialogs */}
      <EventYearDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) handleDialogClose();
        }}
        mode="create"
      />

      <EventYearDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedEventYear(null);
            handleDialogClose();
          }
        }}
        eventYear={selectedEventYear}
        mode="edit"
      />

      {selectedEventYear && (
        <DeleteEventYearDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          eventYear={selectedEventYear}
          onDeleted={() => {
            setDeleteDialogOpen(false);
            setSelectedEventYear(null);
            handleDialogClose();
          }}
        />
      )}
    </EventYearDialogContext.Provider>
  );
}