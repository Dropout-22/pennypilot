import argon2 from "argon2";

import { prisma } from "../lib/prisma.js";
import type { RegisterInput } from "../schemas/auth.js";

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
