import { Router } from "express";
import { Prisma } from "../generated/prisma/client.js";

import { registerSchema } from "../schemas/auth.js";
import { registerUser } from "../services/auth.service.js";

const router = Router();

router.post("/register", async (req, res) => {
    // 1. Validate incoming data
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            error: "Validation failed",
            details: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    try {
        // 2. Register the user
        const user = await registerUser(result.data);

        // 3. Return the created account
        res.status(201).json({
            message: "Account created successfully",
            user,
        });
    } catch (error) {
        // 4. Handle duplicate email addresses
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            res.status(409).json({
                error: "An account with this email already exists.",
            });
            return;
        }

        console.error("Registration failed:", error);

        res.status(500).json({
            error: "Failed to create account.",
        });
    }
});

export default router;
