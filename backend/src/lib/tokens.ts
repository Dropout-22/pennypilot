import { SignJWT, jwtVerify } from "jose";

const getAccessTokenSecret = () => {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    return new TextEncoder().encode(secret);
};

export const generateAccessToken = async (
    userId: string,
    sessionId: string
) => {
    const secret = getAccessTokenSecret();

    return new SignJWT({
        sid: sessionId,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(userId)
        .setIssuer("pennypilot-api")
        .setAudience("pennypilot")
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(secret);
};

export const verifyAccessToken = async (token: string) => {
    const secret = getAccessTokenSecret();

    const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
        issuer: "pennypilot-api",
        audience: "pennypilot",
    });

    return payload;
};

import { createHash, randomBytes } from "node:crypto";

export const generateRefreshToken = (): string => {
    return randomBytes(32).toString("hex");
};

export const hashRefreshToken = (token: string): string => {
    return createHash("sha256")
        .update(token)
        .digest("hex");
};