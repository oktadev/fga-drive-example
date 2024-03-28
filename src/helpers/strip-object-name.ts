import "server-only";

export function stripObjectName(object: string): string {
  const id = object.match(/(?<=:).*/g);
  return id ? id[0] : "";
}
