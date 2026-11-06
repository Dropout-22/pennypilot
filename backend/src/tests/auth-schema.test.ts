import {loginSchema, registerSchema } from "../schemas/auth.js";

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

// Test valid login input
const validLogin = {
    email: "  TEST@EXAMPLE.COM  ",
    password: "PennyPilot-Test-2026!",
};

const loginResult = loginSchema.safeParse(validLogin);

console.log("Valid login:", loginResult.success);

if (loginResult.success) {
    console.log("Normalized login email:", loginResult.data.email);
}

// Test invalid login input
const invalidLogin = {
    email: "not-an-email",
    password: "",
};

const invalidLoginResult = loginSchema.safeParse(invalidLogin);

console.log("Invalid login accepted:", invalidLoginResult.success);
console.log(
    "Login validation errors:",
    invalidLoginResult.success ? [] : invalidLoginResult.error.issues
);
