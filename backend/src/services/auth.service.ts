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

export const refreshUserSession = async (refreshToken: string) => {
    // 1. Hash the refresh token received from the client
    const tokenHash = hashRefreshToken(refreshToken);
    const now = new Date();

    // 2. Generate the replacement refresh token
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    // 3. Validate and rotate the token inside a transaction
    const result = await prisma.$transaction(async (tx) => {
        const storedToken = await tx.refreshToken.findUnique({
            where: {
                tokenHash,
            },
            include: {
                session: true,
            },
        });

        // Token does not exist
        if (!storedToken) {
            return { status: "INVALID" as const };
        }

        // Previously used token: possible token theft or replay
        if (storedToken.usedAt) {
            await tx.session.updateMany({
                where: {
                    id: storedToken.sessionId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            });

            await tx.refreshToken.updateMany({
                where: {
                    sessionId: storedToken.sessionId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            });

            return { status: "REUSED" as const };
        }

        // Reject expired or revoked tokens and sessions
        if (
            storedToken.revokedAt ||
            storedToken.expiresAt <= now ||
            storedToken.session.revokedAt ||
            storedToken.session.expiresAt <= now
        ) {
            return { status: "INVALID" as const };
        }

        // 4. Confirm that the session is still active
        const activeSession = await tx.session.updateMany({
            where: {
                id: storedToken.sessionId,
                revokedAt: null,
                expiresAt: {
                    gt: now,
                },
            },
            data: {
                updatedAt: now,
            },
        });

        if (activeSession.count !== 1) {
            return { status: "INVALID" as const };
        }

        // 5. Atomically claim the old refresh token
        const claimedToken = await tx.refreshToken.updateMany({
            where: {
                id: storedToken.id,
                usedAt: null,
                revokedAt: null,
                expiresAt: {
                    gt: now,
                },
            },
            data: {
                usedAt: now,
            },
        });

        if (claimedToken.count !== 1) {
            // Another request may have already rotated this token
            const latestToken = await tx.refreshToken.findUnique({
                where: {
                    id: storedToken.id,
                },
            });

            if (latestToken?.usedAt) {
                await tx.session.updateMany({
                    where: {
                        id: storedToken.sessionId,
                        revokedAt: null,
                    },
                    data: {
                        revokedAt: now,
                    },
                });

                await tx.refreshToken.updateMany({
                    where: {
                        sessionId: storedToken.sessionId,
                        revokedAt: null,
                    },
                    data: {
                        revokedAt: now,
                    },
                });

                return { status: "REUSED" as const };
            }

            return { status: "INVALID" as const };
        }

        // 6. Store the replacement refresh token hash
        await tx.refreshToken.create({
            data: {
                sessionId: storedToken.sessionId,
                tokenHash: newRefreshTokenHash,
                expiresAt: storedToken.session.expiresAt,
            },
        });

        // 7. Generate a new access token
        const accessToken = await generateAccessToken(
            storedToken.session.userId,
            storedToken.sessionId
        );

        return {
            status: "SUCCESS" as const,
            accessToken,
            refreshToken: newRefreshToken,
        };
    });

    // 8. Return the result
    if (result.status !== "SUCCESS") {
        return null;
    }

    return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    };
};
