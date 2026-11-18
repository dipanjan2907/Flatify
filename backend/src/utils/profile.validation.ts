import { z } from "zod";

export const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),

    mobile: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{7,14}$/)
      .optional(),

    age: z.number().int().min(18).max(100).optional(),

    occupation: z.string().trim().max(80).optional(),

    bio: z.string().trim().max(300).optional(),

    profilePicture: z.string().url().optional(),
  })
  .strict();

export const onboardingSchema = z
  .object({
    intents: z
      .array(
        z.enum([
          "looking-for-flat",
          "looking-for-flatmate",
          "listing-property",
        ]),
      )
      .min(1, "Select at least one intention"),

    preferences: z
      .object({
        preferredLocations: z
          .array(
            z.object({
              city: z.string().trim().min(2),
              localities: z.array(z.string().trim()).default([]),
            }),
          )
          .min(1, "Add at least one preferred city"),

        budget: z.object({
          min: z.number().min(0),
          max: z.number().positive(),
        }),

        moveInDate: z.coerce.date().optional(),

        foodPreference: z
          .enum([
            "vegetarian",
            "non-vegetarian",
            "eggetarian",
            "vegan",
            "no-preference",
          ])
          .optional(),

        smoking: z
          .enum(["yes", "no", "occasionally", "no-preference"])
          .optional(),

        drinking: z
          .enum(["yes", "no", "occasionally", "no-preference"])
          .optional(),

        sleepSchedule: z
          .enum(["early-bird", "night-owl", "flexible"])
          .optional(),

        cleanliness: z.enum(["very-clean", "moderate", "relaxed"]).optional(),
      })
      .refine((data) => data.budget.max >= data.budget.min, {
        message:
          "Maximum budget must be greater than or equal to minimum budget",
        path: ["budget", "max"],
      }),
  })
  .strict();

export type ProfileInput = z.infer<typeof profileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
