// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockGet }),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function makeToken(payload: object, expiresIn = "7d") {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

describe("getSession", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  test("returns null when no auth-token cookie is present", async () => {
    mockGet.mockReturnValue(undefined);
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    expect(session).toBeNull();
  });

  test("returns the session payload for a valid token", async () => {
    const payload = {
      userId: "user-1",
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    const token = await makeToken(payload);
    mockGet.mockReturnValue({ value: token });

    const { getSession } = await import("@/lib/auth");
    const session = await getSession();

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("user-1");
    expect(session?.email).toBe("test@example.com");
  });

  test("returns null for an expired token", async () => {
    const payload = {
      userId: "user-1",
      email: "test@example.com",
      expiresAt: new Date(Date.now() - 1000),
    };
    // Build a token that expired 1 second ago using an absolute past timestamp
    const token = await new SignJWT(payload as Record<string, unknown>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1)
      .sign(JWT_SECRET);
    mockGet.mockReturnValue({ value: token });

    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    expect(session).toBeNull();
  });

  test("returns null for a token signed with the wrong secret", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret");
    const token = await new SignJWT({ userId: "user-1", email: "x@x.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(wrongSecret);
    mockGet.mockReturnValue({ value: token });

    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    expect(session).toBeNull();
  });

  test("returns null for a malformed token string", async () => {
    mockGet.mockReturnValue({ value: "not.a.jwt" });

    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    expect(session).toBeNull();
  });
});
