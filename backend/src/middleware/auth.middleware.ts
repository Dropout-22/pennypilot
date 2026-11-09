
import type { RequestHandler } from "express";
import { verifyAccessToken } from "../lib/tokens.js";
import { prisma } from "../lib/prisma.js";

export const authenticate: RequestHandler = async (
    req,
    res,
    next
) => {
    const authorization = req.headers.authorization;

    // Check whether the Authorization header exists.
    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({
            error: "Access token is required.",
        });
        return;
    }

    // Extract the token after "Bearer ".
    const token = authorization.slice(7).trim();

    if (!token) {
        res.status(401).json({
            error: "Access token is required.",
        });
        return;
    }

    try {
        // Verify the JWT signature and claims.
        const payload = await verifyAccessToken(token);

        // Ensure the required identity claims exist.
        if (
            typeof payload.sub !== "string" ||
            typeof payload.sid !== "string"
        ) {
            res.status(401).json({
                error: "Invalid access token.",
            });
            return;
        }

        // Verify that the session is still active.
        const session = await prisma.session.findFirst({
            where: {
                id: payload.sid,
                userId: payload.sub,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            select: {
                id: true,
            },
        });

        if (!session) {
            res.status(401).json({
                error: "Session is invalid or has expired.",
            });
            return;
        }

        // Attach the verified identity to the request.
        req.auth = {
            userId: payload.sub,
            sessionId: payload.sid,
        };

        // Continue to the protected route.
        next();
    } catch {
        res.status(401).json({
            error: "Invalid or expired access token.",
        });
    }
};
