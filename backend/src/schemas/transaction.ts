
import { z } from "zod";

const transactionFields = {
    amount: z.string()
        .regex(
            /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
            "Amount must be a positive monetary value with at most two decimal places."
        )
        .refine(
            (value) => Number(value) > 0,
            "Amount must be greater than zero."
        ),

    type: z.enum(["INCOME", "EXPENSE"]),

    categoryId: z.uuid(),

    description: z.string()
        .trim()
        .max(500, "Description cannot exceed 500 characters.")
        .nullable()
        .optional(),

    occurredAt: z.iso.datetime().optional(),
};

// Validation when creating a transaction.
export const createTransactionSchema = z.strictObject(
    transactionFields
);

// Validation when updating a transaction.
export const updateTransactionSchema = z.strictObject(
    transactionFields
)
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        "At least one field must be provided."
    );

export type CreateTransactionInput =
    z.infer<typeof createTransactionSchema>;

export type UpdateTransactionInput =
    z.infer<typeof updateTransactionSchema>;
