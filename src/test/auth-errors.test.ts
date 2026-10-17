import { describe, it, expect } from "vitest";
import { friendly } from "@/lib/auth-errors";

describe("auth error messages", () => {
  it("explains wrong credentials and points to password reset", () => {
    expect(friendly("Invalid login credentials")).toContain("Forgot password?");
  });
  it("explains unconfirmed email", () => {
    expect(friendly("Email not confirmed")).toContain("isn't confirmed");
  });
  it("explains leaked/weak passwords", () => {
    expect(friendly("Password is known to be weak and easy to guess, please choose a different one.")).toContain("stronger");
  });
  it("explains disallowed email domains", () => {
    expect(friendly("This email address is not allowed. Placeholder, reserved...")).toContain("real email");
  });
  it("passes unknown messages through", () => {
    expect(friendly("Something else")).toBe("Something else");
  });
});
