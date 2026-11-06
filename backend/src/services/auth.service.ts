import argon2 from "argon2";

import { prisma } from "../lib/prisma.js";
import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
} from "../lib/tokens.js";

import type { RegisterInput } from "../schemas/auth.js";
import type { LoginInput } from "../schemas/auth.js";

export const registerUser = async (input: RegisterInput) => {
    // 1. Hash the password using Argon2id
    const passwordHash = await argon2.hash(input.password, {
        type: argon2.argon2id,
    });

    // 2. Create the user in PostgreSQL
    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    // 3. Return only safe user information
    return user;
};

export const loginUser = async (input: LoginInput) => {
    // 1. Find the account using the normalized email
    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });

    // 2. Reject unknown email addresses
    if (!user) {
        return null;
    }

    // 3. Verify the submitted password against the stored hash
    const passwordIsValid = await argon2.verify(
        user.passwordHash,
        input.password
    );

    // 4. Reject incorrect passwords
    if (!passwordIsValid) {
        return null;
    }

    // 5. Define session and refresh-token lifetimes
    const sessionExpiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    const refreshTokenExpiresAt = sessionExpiresAt;

    // 6. Generate the tokens
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // 7. Create the session and refresh-token record atomically
    const session = await prisma.$transaction(async (tx) => {
        const newSession = await tx.session.create({
            data: {
                userId: user.id,
                expiresAt: sessionExpiresAt,
            },
        });

        await tx.refreshToken.create({
            data: {
                sessionId: newSession.id,
                tokenHash: refreshTokenHash,
                expiresAt: refreshTokenExpiresAt,
            },
        });

        return newSession;
    });

    // 8. Generate the short-lived access token
    const accessToken = await generateAccessToken(
        user.id,
        session.id
    );

    // 9. Return safe user information and authentication tokens
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
    };
};