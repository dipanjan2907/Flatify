import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url(),
  fileId: z.string().min(1),
  filePath: z.string().min(1),
});

export const createPropertySchema = z
  .object({
    title: z.string().trim().min(5).max(100),

    description: z.string().trim().min(20).max(2000),

    location: z.object({
      city: z.string().trim().min(2),
      locality: z.string().trim().min(2),
      address: z.string().trim().min(5),
    }),

    rent: z.number().positive(),

    securityDeposit: z.number().min(0),

    propertyType: z.enum(["apartment", "independent-house", "villa", "pg"]),

    listingType: z.enum(["entire-flat", "private-room", "shared-room"]),

    furnishing: z.enum(["unfurnished", "semi-furnished", "fully-furnished"]),

    bedrooms: z.number().int().min(0).max(20),

    bathrooms: z.number().int().min(1).max(20),

    amenities: z.array(z.string().trim()).max(30).default([]),

    images: z.array(imageSchema).min(1).max(8),

    availableFrom: z.coerce.date(),

    rules: z.array(z.string().trim()).max(20).default([]),
  })
  .strict();

export const updatePropertySchema = createPropertySchema
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export const propertyStatusSchema = z.object({
  status: z.enum(["active", "rented", "inactive"]),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
