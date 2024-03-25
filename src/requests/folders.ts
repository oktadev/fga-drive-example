export async function getFolder(route) {
  const response = await fetch(route);
  return response.json();
}

export async function getAllFolders(route) {
  const response = await fetch(route);
  return response.json();
}

export async function createFolder(parent, name) {
  const response = await fetch(`/api/folders`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      parent,
    }),
  });
  return response;
}
