import "server-only";
import * as argon2 from "argon2";

// OWASP Argon2id minimum: 19 MiB, two iterations, one lane. Library generates salt.
const options = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;
export const hashPassword = (password: string) => argon2.hash(password, options);

let dummyHash: Promise<string> | undefined;
export async function verifyPassword(password: string, storedHash?: string) {
  // Unknown emails still perform the same password-verification work.
  dummyHash ??= hashPassword("internal dummy credential, never an account");
  const valid = await argon2.verify(storedHash ?? await dummyHash, password);
  return Boolean(storedHash) && valid;
}
