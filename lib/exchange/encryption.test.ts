import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { decryptSecret, encryptSecret, maskApiKey } from "./encryption";

const TEST_KEY_B64 = Buffer.alloc(32, 7).toString("base64");

describe("exchange encryption", () => {
  before(() => {
    process.env.XOLID_MASTER_ENCRYPTION_KEY = TEST_KEY_B64;
  });

  after(() => {
    delete process.env.XOLID_MASTER_ENCRYPTION_KEY;
  });

  it("round-trips secrets with AES-256-GCM", () => {
    const plain = "my-binance-api-secret-value";
    const encrypted = encryptSecret(plain);
    assert.notEqual(encrypted, plain);
    assert.equal(decryptSecret(encrypted), plain);
  });

  it("produces different ciphertext for same plaintext", () => {
    const a = encryptSecret("same");
    const b = encryptSecret("same");
    assert.notEqual(a, b);
    assert.equal(decryptSecret(a), "same");
    assert.equal(decryptSecret(b), "same");
  });

  it("masks api keys for display", () => {
    assert.equal(maskApiKey("abcd1234"), "****1234");
    assert.equal(maskApiKey("ab"), "****");
  });
});
