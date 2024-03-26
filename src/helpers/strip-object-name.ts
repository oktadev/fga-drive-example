import "server-only";

export function stripObjectName(object: string): string | undefined {
  const id = object.match(/(?<=:).*/g);
  return id ? id[0] : undefined;
}
