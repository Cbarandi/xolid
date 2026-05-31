import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditEventLabel, formatAuditEntity } from "./labels";

describe("audit labels", () => {
  it("maps event types to readable labels", () => {
    assert.equal(auditEventLabel("LOGIN_SUCCESS"), "Login success");
    assert.equal(auditEventLabel("BOT_STARTED"), "Bot started");
  });

  it("formats entity display from metadata", () => {
    assert.equal(
      formatAuditEntity("bot", "abc-123", { name: "My Bot" }),
      "bot · My Bot",
    );
    assert.equal(formatAuditEntity("auth", null, { username: "cristian" }), "cristian");
  });
});
