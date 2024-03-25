export async function ShareFile(fileId: string, email: string) {
  const response = await fetch(`/api/files/${fileId}/share`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return response;
}

export async function ShareFolder(folderId: string, email: string) {
  const response = await fetch(`/api/folders/${folderId}/share`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return response;
}
