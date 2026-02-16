export type Screen = 'LANDING' | 'LOCATION_SELECT' | 'PREFERENCES' | 'ITINERARY' | 'MY_TRIPS';

export interface TripLocation {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  tags: string[];
  daysRecommended: number;
}

export interface SelectedLocation extends TripLocation {
  userNotes?: string;
  // Itinerary specific fields
  assignedStartDate?: string; // ISO string for easier serialization
  assignedEndDate?: string;
  // User defined duration
  stayDays?: number; 
  stayHours?: number;
}

export interface TimelineEvent {
  time: string;
  title: string;
  duration?: string;
  cost?: string;
  description?: string;
  tags?: string[];
  type: 'activity' | 'transport' | 'dining';
  mustSee?: boolean;
  crowded?: boolean;
  aiNote?: string;
}