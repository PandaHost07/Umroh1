import { put } from "@vercel/blob";

export async function uploadFileToVercel(file, folder) {
  const fileName = `${Date.now()}-${file.name}`;
  const path = `${folder}/${fileName}`;

  const blob = await put(path, file, {
    access: "public",
  });

  return blob.url;
}