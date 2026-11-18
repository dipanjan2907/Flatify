import mongoose, { Schema, Document } from "mongoose";

export const USER_INTENTS = [
  "looking-for-flat",
  "looking-for-flatmate",
  "listing-property",
] as const;

export const FOOD_PREFERENCES = [
  "vegetarian",
  "non-vegetarian",
  "eggetarian",
  "vegan",
  "no-preference",
] as const;

export const LIFESTYLE_OPTIONS = [
  "yes",
  "no",
  "occasionally",
  "no-preference",
] as const;

export const SLEEP_OPTIONS = ["early-bird", "night-owl", "flexible"] as const;

export const CLEANLINESS_OPTIONS = [
  "very-clean",
  "moderate",
  "relaxed",
] as const;

interface ILocationPreference {
  city: string;
  localities: string[];
}

interface IPreferences {
  preferredLocations: ILocationPreference[];
  budget: {
    min: number;
    max: number;
  };
  moveInDate?: Date;
  foodPreference?: string;
  smoking?: string;
  drinking?: string;
  sleepSchedule?: string;
  cleanliness?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  password: string;

  profilePicture?: string;
  age?: number;
  occupation?: string;
  bio?: string;

  intents: string[];
  preferences: IPreferences;
  onboardingCompleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const locationPreferenceSchema = new Schema<ILocationPreference>(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    localities: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const preferencesSchema = new Schema<IPreferences>(
  {
    preferredLocations: {
      type: [locationPreferenceSchema],
      default: [],
    },

    budget: {
      min: {
        type: Number,
        default: 0,
        min: 0,
      },
      max: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    moveInDate: Date,

    foodPreference: {
      type: String,
      enum: FOOD_PREFERENCES,
    },

    smoking: {
      type: String,
      enum: LIFESTYLE_OPTIONS,
    },

    drinking: {
      type: String,
      enum: LIFESTYLE_OPTIONS,
    },

    sleepSchedule: {
      type: String,
      enum: SLEEP_OPTIONS,
    },

    cleanliness: {
      type: String,
      enum: CLEANLINESS_OPTIONS,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    age: {
      type: Number,
      min: 18,
      max: 100,
    },

    occupation: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    intents: {
      type: [
        {
          type: String,
          enum: USER_INTENTS,
        },
      ],
      default: [],
    },

    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
