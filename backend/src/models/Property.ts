import mongoose, { Schema, Document } from "mongoose";

export const PROPERTY_TYPES = [
  "apartment",
  "independent-house",
  "villa",
  "pg",
] as const;

export const LISTING_TYPES = [
  "entire-flat",
  "private-room",
  "shared-room",
] as const;

export const FURNISHING_TYPES = [
  "unfurnished",
  "semi-furnished",
  "fully-furnished",
] as const;

export const PROPERTY_STATUSES = ["active", "rented", "inactive"] as const;

export interface IPropertyImage {
  url: string;
  fileId: string;
  filePath: string;
}

export interface IProperty extends Document {
  owner: mongoose.Types.ObjectId;

  title: string;
  description: string;

  location: {
    city: string;
    locality: string;
    address: string;
  };

  rent: number;
  securityDeposit: number;

  propertyType: string;
  listingType: string;
  furnishing: string;

  bedrooms: number;
  bathrooms: number;

  amenities: string[];
  images: IPropertyImage[];

  availableFrom: Date;
  rules: string[];

  status: string;

  createdAt: Date;
  updatedAt: Date;
}

const propertyImageSchema = new Schema<IPropertyImage>(
  {
    url: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const propertySchema = new Schema<IProperty>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },

    location: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      locality: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    rent: {
      type: Number,
      required: true,
      min: 1,
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },

    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: true,
    },

    listingType: {
      type: String,
      enum: LISTING_TYPES,
      required: true,
    },

    furnishing: {
      type: String,
      enum: FURNISHING_TYPES,
      required: true,
    },

    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },

    bathrooms: {
      type: Number,
      required: true,
      min: 1,
    },

    amenities: {
      type: [String],
      default: [],
    },

    images: {
      type: [propertyImageSchema],
      default: [],
    },

    availableFrom: {
      type: Date,
      required: true,
    },

    rules: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: PROPERTY_STATUSES,
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

propertySchema.index({
  "location.city": 1,
  "location.locality": 1,
  status: 1,
  rent: 1,
});

propertySchema.index({ createdAt: -1 });

const Property = mongoose.model<IProperty>("Property", propertySchema);

export default Property;
