/**
 * ImageKit upload helper.
 * Used server-side only (Private Key must not be exposed to the client).
 */

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY!;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT!;

/**
 * Uploads a file buffer to ImageKit and returns the public URL.
 */
export async function uploadBufferToImageKit(
  buffer: Buffer,
  fileName: string,
  folder = "/account-images/",
): Promise<string> {
  const base64 = buffer.toString("base64");

  const form = new URLSearchParams();
  form.append("file", base64);
  form.append("fileName", fileName);
  form.append("folder", folder);

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(IMAGEKIT_PRIVATE_KEY + ":").toString("base64")}`,
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ImageKit upload failed: ${err}`);
  }

  const data = await res.json();
  return data.url as string;
}

/**
 * Uploads a File (from FormData) to ImageKit and returns the public URL.
 */
export async function uploadFileToImageKit(file: File, folder?: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = file.name.split(".").pop() ?? "jpg";
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const fileName = `${uniqueId}-${Date.now()}.${ext}`;

  return uploadBufferToImageKit(buffer, fileName, folder);
}

/**
 * Returns the ImageKit URL endpoint for building URLs on the client.
 */
export function getImageKitEndpoint(): string {
  return IMAGEKIT_URL_ENDPOINT;
}
