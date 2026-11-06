import { z } from "zod";

export const registerSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "Name must be at least 2 characters.")
        .max(100, "Name cannot exceed 100 characters."),

    email: z.string()
        .trim()
        .toLowerCase()
        .pipe(z.email("Please provide a valid email address.")),

    password: z.string()
        .min(12, "Password must be at least 12 characters.")
        .max(128, "Password cannot exceed 128 characters."),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .pipe(z.email("Please provide a valid email address.")),

    password: z.string()
        .min(1, "Password is required.")
        .max(128, "Password cannot exceed 128 characters."),
}).strict();

export type LoginInput = z.infer<typeof loginSchema>;
