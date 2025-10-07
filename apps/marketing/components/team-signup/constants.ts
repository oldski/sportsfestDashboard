// Mock event types for development/viewing
export const EventType = {
  BEACH_VOLLEYBALL: 'beach_volleyball',
  TUG_OF_WAR: 'tug_of_war',
  CORN_TOSS: 'corn_toss',
  BOTE_BEACH_CHALLENGE: 'bote_beach_challenge',
  BEACH_DODGEBALL: 'beach_dodgeball'
} as const;

export type EventTypeValue = typeof EventType[keyof typeof EventType];

export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export const TShirtSize = {
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl',
  XXL: 'xxl',
  XXXL: 'xxxl'
} as const;

// Event details for display
export const EVENT_DETAILS: Record<EventTypeValue, { name: string; emoji: string }> = {
  [EventType.BEACH_VOLLEYBALL]: { name: 'Beach Volleyball', emoji: '🏐' },
  [EventType.TUG_OF_WAR]: { name: 'Tug of War', emoji: '💪' },
  [EventType.CORN_TOSS]: { name: 'Corn Toss', emoji: '🌽' },
  [EventType.BOTE_BEACH_CHALLENGE]: { name: 'BOTE Beach Challenge', emoji: '🏄‍♂️' },
  [EventType.BEACH_DODGEBALL]: { name: 'Beach Dodgeball', emoji: '🔵' }
};

// Gender options for display
export const GENDER_OPTIONS = {
  [Gender.MALE]: 'Male',
  [Gender.FEMALE]: 'Female',
};

// T-shirt size options
export const TSHIRT_SIZE_OPTIONS = {
  [TShirtSize.XS]: 'XS',
  [TShirtSize.S]: 'S',
  [TShirtSize.M]: 'M',
  [TShirtSize.L]: 'L',
  [TShirtSize.XL]: 'XL',
  [TShirtSize.XXL]: 'XXL',
  [TShirtSize.XXXL]: 'XXXL'
};
