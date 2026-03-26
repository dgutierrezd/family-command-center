export type FamilyRole = "admin" | "member" | "child";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  google_refresh_token: string | null;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface FamilyMember {
  family_id: string;
  user_id: string;
  role: FamilyRole;
  joined_at: string;
  user?: User;
}

export interface CalendarEvent {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  recurrence_rule: string | null;
  google_event_id: string | null;
  color: string;
  created_by: string;
  created_at: string;
}

export interface Meal {
  id: string;
  family_id: string;
  name: string;
  date: string;
  meal_type: MealType;
  recipe_url: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  ingredients?: MealIngredient[];
}

export interface MealIngredient {
  id: string;
  meal_id: string;
  name: string;
  quantity: string | null;
  category: string;
}

export interface GroceryItem {
  id: string;
  family_id: string;
  name: string;
  quantity: string | null;
  category: string;
  source_meal_id: string | null;
  checked: boolean;
  checked_by: string | null;
  created_at: string;
}

export interface Chore {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  recurrence_rule: string | null;
  points: number;
  created_by: string;
  created_at: string;
  assignee?: User | null;
  completions?: ChoreCompletion[];
}

export interface ChoreCompletion {
  id: string;
  chore_id: string;
  completed_by: string;
  completed_at: string;
  verified_by: string | null;
  completer?: User | null;
}

export interface WeatherData {
  current_temp: number;
  high: number;
  low: number;
  precipitation_probability: number;
  weather_code: number;
  forecast: {
    date: string;
    high: number;
    low: number;
    precipitation_probability: number;
    weather_code: number;
  }[];
}

export interface SharedList {
  id: string;
  family_id: string;
  name: string;
  template: string | null;
  archived: boolean;
  created_by: string;
  created_at: string;
  items?: SharedListItem[];
  _count?: { items: number };
}

export interface SharedListItem {
  id: string;
  list_id: string;
  name: string;
  checked: boolean;
  created_by: string;
  created_at: string;
}

export type RedemptionStatus = "pending" | "approved" | "denied";

export interface Reward {
  id: string;
  family_id: string;
  name: string;
  description: string | null;
  points_cost: number;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface Redemption {
  id: string;
  reward_id: string;
  redeemed_by: string;
  status: RedemptionStatus;
  approved_by: string | null;
  created_at: string;
  resolved_at: string | null;
  reward?: Reward;
  redeemer?: User;
}

export interface MealSuggestion {
  name: string;
  meal_type: MealType;
  ingredients: { name: string; quantity: string; category: string }[];
}
