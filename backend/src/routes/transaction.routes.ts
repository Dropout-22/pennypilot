import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createTransactionSchema } from "../schemas/transaction.js";
import { updateTransactionSchema } from "../schemas/transaction.js";
import { z } from "zod";
import {
    getUserTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from "../services/transaction.service.js";

const router = Router();

// All transaction routes require authentication.
router.use(authenticate);

// GET /api/transactions
router.get("/", async (req, res) => {
    try {
        const transactions = await getUserTransactions(req.auth!.userId);

        res.status(200).json({
            transactions,
        });
    } catch (error) {
        console.error("Failed to retrieve transactions:", error);

        res.status(500).json({
            error: "Failed to retrieve transactions.",
        });
    }
});

export default router;

// POST /api/transactions
router.post("/", async (req, res) => {
    try {
        const result = createTransactionSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                error: "Invalid transaction data.",
                details: result.error.issues,
            });
            return;
        }

        const transaction = await createTransaction(
            req.auth!.userId,
            result.data
        );

        res.status(201).json({
            message: "Transaction created successfully.",
            transaction,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Invalid category for this transaction type."
        ) {
            res.status(400).json({
                error: error.message,
            });
            return;
        }

        console.error("Failed to create transaction:", error);

        res.status(500).json({
            error: "Failed to create transaction.",
        });
    }
});

// PATCH /api/transactions/:id
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string" || !z.uuid().safeParse(id).success) {
            res.status(400).json({
                error: "Invalid transaction ID.",
            });
            return;
        }

        const result = updateTransactionSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                error: "Invalid transaction data.",
                details: result.error.issues,
            });
            return;
        }

        const transaction = await updateTransaction(
            req.auth!.userId,
            id,
            result.data
        );

        if (!transaction) {
            res.status(404).json({
                error: "Transaction not found.",
            });
            return;
        }

        res.status(200).json({
            message: "Transaction updated successfully.",
            transaction,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Invalid category for this transaction type."
        ) {
            res.status(400).json({
                error: error.message,
            });
            return;
        }

        console.error("Failed to update transaction:", error);

        res.status(500).json({
            error: "Failed to update transaction.",
        });
    }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string" || !z.uuid().safeParse(id).success) {
            res.status(400).json({
                error: "Invalid transaction ID.",
            });
            return;
        }

        const deleted = await deleteTransaction(
            req.auth!.userId,
            id
        );

        if (!deleted) {
            res.status(404).json({
                error: "Transaction not found.",
            });
            return;
        }

        res.status(200).json({
            message: "Transaction deleted successfully.",
        });
    } catch (error) {
        console.error("Failed to delete transaction:", error);

        res.status(500).json({
            error: "Failed to delete transaction.",
        });
    }
});