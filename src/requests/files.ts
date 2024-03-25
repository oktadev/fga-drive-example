export async function getAllFiles(route: string) {
  const response = await fetch(route);
  return response.json();
}

export async function getSharedFiles(route: string) {
  const response = await fetch(route);
  return response.json();
}