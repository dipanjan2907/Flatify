import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .transform((value) => value.toLowerCase()),

    mobile: z
      .string()
      .trim()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        "Enter a valid mobile number with country code if needed",
      ),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
