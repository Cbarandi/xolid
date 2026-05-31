#!/usr/bin/env npx tsx
/**
 * Hash a private login password for XOLID_PRIVATE_PASSWORD_HASH.
 *
 * Usage:
 *   npm run hash:private-password -- "your-password"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash:private-password -- "your-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
