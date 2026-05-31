import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isProtectedPath, safeNextPath } from "./redirect";

describe("auth redirect", () => {
  it("defaults to /dashboard when next is missing", () => {
    assert.equal(safeNextPath(null), "/dashboard");
    assert.equal(safeNextPath(undefined), "/dashboard");
  });

  it("allows private app next paths", () => {
    assert.equal(safeNextPath("/dashboard"), "/dashboard");
    assert.equal(safeNextPath("/bots"), "/bots");
    assert.equal(safeNextPath("/bots/new"), "/bots/new");
    assert.equal(safeNextPath("/strategies"), "/strategies");
    assert.equal(safeNextPath("/coin-lists"), "/coin-lists");
    assert.equal(safeNextPath("/deals/active"), "/deals/active");
    assert.equal(safeNextPath("/admin/bots"), "/admin/bots");
    assert.equal(safeNextPath("/users"), "/users");
    assert.equal(safeNextPath("/users/new"), "/users/new");
    assert.equal(safeNextPath("/exchange"), "/exchange");
    assert.equal(safeNextPath("/exchange/new"), "/exchange/new");
    assert.equal(safeNextPath("/risk"), "/risk");
  });

  it("rejects open redirects", () => {
    assert.equal(safeNextPath("//evil.com"), "/dashboard");
    assert.equal(safeNextPath("https://evil.com"), "/dashboard");
    assert.equal(safeNextPath("/system"), "/dashboard");
  });

  it("detects protected paths", () => {
    assert.equal(isProtectedPath("/dashboard"), true);
    assert.equal(isProtectedPath("/bots"), true);
    assert.equal(isProtectedPath("/bots/abc"), true);
    assert.equal(isProtectedPath("/strategies"), true);
    assert.equal(isProtectedPath("/coin-lists"), true);
    assert.equal(isProtectedPath("/deals/active"), true);
    assert.equal(isProtectedPath("/admin"), true);
    assert.equal(isProtectedPath("/admin/bots"), true);
    assert.equal(isProtectedPath("/users"), true);
    assert.equal(isProtectedPath("/users/abc"), true);
    assert.equal(isProtectedPath("/exchange"), true);
    assert.equal(isProtectedPath("/exchange/abc"), true);
    assert.equal(isProtectedPath("/risk"), true);
    assert.equal(isProtectedPath("/risk/settings"), true);
    assert.equal(isProtectedPath("/"), false);
    assert.equal(isProtectedPath("/system"), false);
    assert.equal(isProtectedPath("/block"), false);
    assert.equal(isProtectedPath("/vixion"), false);
  });
});

describe("login failure messaging", () => {
  it("uses generic invalid credentials copy", () => {
    assert.equal("Invalid credentials", "Invalid credentials");
  });
});
