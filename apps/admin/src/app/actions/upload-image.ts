"use server";

import { uploadFileToImageKit } from "@thc-efb/shared/imagekit";

/**
 * Server Action: uploads one image file to ImageKit.
 * Called from client-side forms (AccountForm, SuperAdminAccountForm).
 *
 * Expects a FormData with a single field "file" containing the image.
 * Returns the public ImageKit URL.
 */
export async function uploadImageAction(formData: FormData): Promise<string> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    throw new Error("No file provided");
  }

  const url = await uploadFileToImageKit(file);
  return url;
}
