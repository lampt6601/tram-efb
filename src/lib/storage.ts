import { uploadImageAction } from "@/app/actions/upload-image";

/**
 * Uploads an image to ImageKit via the server action
 * and returns the public URL.
 *
 * This replaces the old Supabase Storage upload.
 */
export async function uploadImageToStorage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  return uploadImageAction(fd);
}
