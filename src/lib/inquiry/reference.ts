import {randomInt} from "node:crypto";

/**
 * Server-side inquiry reference: `KR-YYYYMMDD-XXXX`.
 *
 * Generated only by the API route and returned only after a transport reports
 * success, so a reference in a user's hands always corresponds to something
 * that was actually delivered or stored.
 *
 * The suffix alphabet omits characters that are easy to confuse when read over
 * the phone or copied from a screenshot (0/O, 1/I/L, 2/Z, 5/S, 8/B).
 */

const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY34679";
const SUFFIX_LENGTH = 4;

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

export function createReference(now: Date = new Date()): string {
  const date = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(
    now.getUTCDate()
  )}`;

  let suffix = "";
  for (let index = 0; index < SUFFIX_LENGTH; index += 1) {
    suffix += ALPHABET[randomInt(0, ALPHABET.length)];
  }

  return `KR-${date}-${suffix}`;
}
