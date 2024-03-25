import "server-only";
import { Hash, createHash } from "crypto";

export function getFileHash(buffer: Buffer): Hash {
  var hash = createHash("sha1");
  hash.setEncoding("hex");
  hash.write(buffer);
  hash.end();
  return hash.read();
}
