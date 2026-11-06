import { registerSchema } from "../schemas/auth.js";

const validInput = {
    name: "  Anthony  ",
    email: "ANTHONY@EXAMPLE.COM",
    password: "a-strong-password",
};

const result = registerSchema.safeParse(validInput);

console.log("Valid input:", result.success);

if (result.success) {
    console.log("Normalized name:", result.data.name);
    console.log("Normalized email:", result.data.email);
}

const invalidInput = {
    name: "A",
    email: "not-an-email",
    password: "short",
};

const invalidResult = registerSchema.safeParse(invalidInput);

console.log("Invalid input accepted:", invalidResult.success);
console.log("Validation errors:", invalidResult.success ? [] : invalidResult.error.issues);
