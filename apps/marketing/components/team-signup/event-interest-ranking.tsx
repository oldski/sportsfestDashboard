'use client';

import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { GripHorizontalIcon } from 'lucide-react';

// dnd-kit imports
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
  [EventType.BOTE_BEACH_CHALLENGE]: { name: 'Surf & Turf Rally', emoji: '🏄‍♂️' },
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
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "flex items-center justify-between p-4 bg-foregground rounded-lg border",
        "transition-all duration-200 hover:shadow-md hover:border-primary/50",
        isDragging && "opacity-30"
      )}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
          {index + 1}
        </div>
        <span className="text-lg flex-shrink-0">{EVENT_DETAILS[event].emoji}</span>
        <span className="font-medium truncate">{EVENT_DETAILS[event].name}</span>
      </div>
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-2 -m-2 hover:bg-accent rounded ml-2"
      >
        <GripHorizontalIcon className="size-5 text-muted-foreground flex-shrink-0" />
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

  const [activeId, setActiveId] = React.useState<EventTypeValue | null>(null);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  // Detect if device supports touch
  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as EventTypeValue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRankings((items) => {
        const oldIndex = items.indexOf(active.id as EventTypeValue);
        const newIndex = items.indexOf(over.id as EventTypeValue);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="font-semibold">Rank Your Event Interests</h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop to reorder events by your interest level (1 = most interested)
        </p>
      </div>

      <div style={{ position: 'relative', isolation: 'isolate' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
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
          {/* Only use DragOverlay on touch devices - desktop uses native drag */}
          {isTouchDevice && (
            <DragOverlay dropAnimation={null}>
              {activeId ? (
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border shadow-lg w-full max-w-2xl">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                      {rankings.indexOf(activeId) + 1}
                    </div>
                    <span className="text-lg flex-shrink-0">{EVENT_DETAILS[activeId].emoji}</span>
                    <span className="font-medium truncate">{EVENT_DETAILS[activeId].name}</span>
                  </div>
                  <GripHorizontalIcon className="size-5 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              ) : null}
            </DragOverlay>
          )}
        </DndContext>
      </div>

      {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
    </div>
  );
}
