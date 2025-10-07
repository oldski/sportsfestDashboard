'use client';

import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { GripVerticalIcon } from 'lucide-react';

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Event types (should match the main page)
const EventType = {
  BEACH_VOLLEYBALL: 'beach_volleyball',
  TUG_OF_WAR: 'tug_of_war',
  CORN_TOSS: 'corn_toss',
  BOTE_BEACH_CHALLENGE: 'bote_beach_challenge',
  BEACH_DODGEBALL: 'beach_dodgeball'
} as const;

type EventTypeValue = typeof EventType[keyof typeof EventType];

// Event details for display
const EVENT_DETAILS: Record<EventTypeValue, { name: string; emoji: string }> = {
  [EventType.BEACH_VOLLEYBALL]: { name: 'Beach Volleyball', emoji: '🏐' },
  [EventType.TUG_OF_WAR]: { name: 'Tug of War', emoji: '💪' },
  [EventType.CORN_TOSS]: { name: 'Corn Toss', emoji: '🌽' },
  [EventType.BOTE_BEACH_CHALLENGE]: { name: 'BOTE Beach Challenge', emoji: '🏄‍♂️' },
  [EventType.BEACH_DODGEBALL]: { name: 'Beach Dodgeball', emoji: '🔵' }
};

// Sortable item component using dnd-kit
function SortableEventItem({
  event,
  index,
}: {
  event: EventTypeValue;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center justify-between p-4 bg-foregground rounded-lg border cursor-grab active:cursor-grabbing",
        "transition-all duration-200 hover:shadow-md hover:border-primary/50",
        isDragging && "shadow-lg ring-2 ring-primary/20 z-50"
      )}
    >
      <div className="flex items-center space-x-3">
        <GripVerticalIcon className="size-4 text-muted-foreground flex-shrink-0" />
        <div className="flex items-center space-x-3">
          <span className="text-lg flex-shrink-0">{EVENT_DETAILS[event].emoji}</span>
          <span className="font-medium">{EVENT_DETAILS[event].name}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
          {index + 1}
        </div>
      </div>
    </div>
  );
}

// Drag-and-drop event ranking component with dnd-kit
interface EventInterestRankingProps {
  value: Record<EventTypeValue, number>;
  onChange: (value: Record<EventTypeValue, number>) => void;
  error?: string;
}

export function EventInterestRanking({
  value,
  onChange,
  error
}: EventInterestRankingProps) {
  const [rankings, setRankings] = React.useState<EventTypeValue[]>(() => {
    // Sort events by their current ranking (1 = highest priority)
    return Object.entries(value || {})
      .sort(([, a], [, b]) => a - b)
      .map(([eventType]) => eventType as EventTypeValue);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    // Update parent with current rankings
    const newValue = {} as Record<EventTypeValue, number>;
    rankings.forEach((eventType, index) => {
      newValue[eventType] = index + 1; // 1-based ranking
    });
    onChange(newValue);
  }, [rankings, onChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setRankings((items) => {
        const oldIndex = items.indexOf(active.id as EventTypeValue);
        const newIndex = items.indexOf(over?.id as EventTypeValue);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="font-semibold">Rank Your Event Interests</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop to reorder events by your interest level (1 = most interested)
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rankings}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {rankings.map((eventType, index) => (
              <SortableEventItem
                key={eventType}
                event={eventType}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
    </div>
  );
}
