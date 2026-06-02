import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "./schemas";

describe("signInSchema", () => {
  it("accepts a valid email + password", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.com", password: "x" }).success,
    ).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      signInSchema.safeParse({ email: "not-an-email", password: "x" }).success,
    ).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("signUpSchema", () => {
  const valid = {
    name: "Ali",
    email: "a@b.com",
    password: "pass1234",
    confirmPassword: "pass1234",
    role: "STUDENT" as const,
    terms: true as const,
  };

  it("accepts a fully valid registration", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a weak password without a digit", () => {
    expect(
      signUpSchema.safeParse({
        ...valid,
        password: "password",
        confirmPassword: "password",
      }).success,
    ).toBe(false);
  });

  it("flags mismatched confirmation on the confirmPassword path", () => {
    const res = signUpSchema.safeParse({ ...valid, confirmPassword: "other1234" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(
        true,
      );
    }
  });

  it("requires the terms checkbox", () => {
    expect(signUpSchema.safeParse({ ...valid, terms: false }).success).toBe(false);
  });

  it("rejects an unsupported role", () => {
    expect(signUpSchema.safeParse({ ...valid, role: "ADMIN" }).success).toBe(false);
  });
});
