import { Router } from "express";
import { Prisma } from "../generated/prisma/client.js";

import { loginSchema, registerSchema } from "../schemas/auth.js";
import { loginUser, registerUser } from "../services/auth.service.js";

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

router.post("/login", async (req, res) => {
    // 1. Validate incoming data
    const result = loginSchema.safeParse(req.body);

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
        // 2. Verify user credentials and create a session
        const auth = await loginUser(result.data);

        if (!auth) {
            res.status(401).json({
                error: "Invalid email or password.",
            });
            return;
        }

        // 3. Set the refresh token in an HttpOnly cookie
        res.cookie("refreshToken", auth.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        // 4. Return safe user information and access token
        res.status(200).json({
            message: "Login successful",
            user: auth.user,
            accessToken: auth.accessToken,
        });
    } catch (error) {
        console.error("Login failed:", error);

        res.status(500).json({
            error: "Failed to log in.",
        });
    }
});

export default router;
