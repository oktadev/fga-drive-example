export async function upload(folder: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/files?parent=${folder}`, {
    method: "POST",
    body: formData,
  });

  if (response.status === 200) {
    return response.json();
  }

  return {};
}
