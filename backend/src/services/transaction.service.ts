import { prisma } from "../lib/prisma.js";
import type {
    CreateTransactionInput,
    UpdateTransactionInput,
} from "../schemas/transaction.js";

export const getUserTransactions = async (userId: string) => {
    return prisma.transaction.findMany({
        where: {
            userId,
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
        orderBy: {
            occurredAt: "desc",
        },
    });
};

export const createTransaction = async (
    userId: string,
    input: CreateTransactionInput
) => {
    // Confirm that the category exists and matches the transaction type.
    const category = await prisma.category.findUnique({
        where: {
            id: input.categoryId,
        },
        select: {
            id: true,
            type: true,
        },
    });

    if (!category || category.type !== input.type) {
        throw new Error("Invalid category for this transaction type.");
    }

    // Create the transaction and associate it with its owner.
    return prisma.transaction.create({
        data: {
            amount: input.amount,
            type: input.type,
            description: input.description ?? null,
            occurredAt: input.occurredAt
                ? new Date(input.occurredAt)
                : undefined,
            user: {
                connect: {
                    id: userId,
                },
            },
            category: {
                connect: {
                    id: category.id,
                },
            },
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
    });
};


export const updateTransaction = async (
    userId: string,
    transactionId: string,
    input: UpdateTransactionInput
) => {
    // Find the transaction, but only if it belongs to this user.
    const existingTransaction = await prisma.transaction.findFirst({
        where: {
            id: transactionId,
            userId,
        },
        select: {
            categoryId: true,
            type: true,
        },
    });

    if (!existingTransaction) {
        return null;
    }

    // Determine the category and type after the proposed update.
    const categoryId = input.categoryId ?? existingTransaction.categoryId;
    const type = input.type ?? existingTransaction.type;

    // Confirm that the resulting category matches the resulting type.
    const category = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
        select: {
            id: true,
            type: true,
        },
    });

    if (!category || category.type !== type) {
        throw new Error("Invalid category for this transaction type.");
    }

    // Separate fields that need special handling.
    const { categoryId: newCategoryId, occurredAt, ...fields } = input;

    // Update only the transaction belonging to this user.
    return prisma.transaction.update({
        where: {
            id: transactionId,
            userId,
        },
        data: {
            ...fields,
            ...(occurredAt !== undefined && {
                occurredAt: new Date(occurredAt),
            }),
            ...(newCategoryId !== undefined && {
                category: {
                    connect: {
                        id: newCategoryId,
                    },
                },
            }),
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            },
        },
    });
};

export const deleteTransaction = async (
    userId: string,
    transactionId: string
) => {
    // Delete only if the transaction belongs to this user.
    const result = await prisma.transaction.deleteMany({
        where: {
            id: transactionId,
            userId,
        },
    });

    return result.count > 0;
};