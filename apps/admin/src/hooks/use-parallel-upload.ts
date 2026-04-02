import { useState, useCallback, useRef } from "react";

export type FileUploadStatus = "pending" | "uploading" | "done" | "error";

export interface FileUploadState {
  /** 0–100 */
  progress: number;
  status: FileUploadStatus;
  url?: string;
  error?: string;
}

export interface UseParallelUploadReturn {
  /** Per-file upload state, indexed same as the files array passed to `upload` */
  files: FileUploadState[];
  /** Overall progress 0–100 (average of all files) */
  overallProgress: number;
  /** True while any file is still uploading */
  isUploading: boolean;
  /** Number of files that completed successfully */
  doneCount: number;
  /** Total number of files being uploaded */
  totalCount: number;
  /** Start parallel uploads. Returns array of uploaded URLs (empty string for failed ones). */
  upload: (files: File[]) => Promise<string[]>;
  /** Reset state */
  reset: () => void;
}

function uploadFileXHR(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        // Cap at 95% — the remaining 5% covers server-side ImageKit processing
        const pct = Math.min(95, Math.round((e.loaded / e.total) * 95));
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          onProgress(100);
          resolve(data.url as string);
        } catch {
          reject(new Error("Invalid response"));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.error || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", "/api/upload-image");
    xhr.send(formData);
  });
}

export function useParallelUpload(): UseParallelUploadReturn {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const filesRef = useRef<FileUploadState[]>([]);

  const updateFile = (index: number, patch: Partial<FileUploadState>) => {
    filesRef.current = filesRef.current.map((f, i) =>
      i === index ? { ...f, ...patch } : f,
    );
    setFiles([...filesRef.current]);
  };

  const upload = useCallback(async (fileList: File[]): Promise<string[]> => {
    const initial: FileUploadState[] = fileList.map(() => ({
      progress: 0,
      status: "pending" as const,
    }));
    filesRef.current = initial;
    setFiles(initial);

    const promises = fileList.map((file, index) => {
      updateFile(index, { status: "uploading" });

      return uploadFileXHR(file, (pct) => {
        updateFile(index, { progress: pct });
      })
        .then((url) => {
          updateFile(index, { status: "done", progress: 100, url });
          return url;
        })
        .catch((err) => {
          updateFile(index, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
          return "";
        });
    });

    return Promise.all(promises);
  }, []);

  const reset = useCallback(() => {
    filesRef.current = [];
    setFiles([]);
  }, []);

  const overallProgress =
    files.length === 0
      ? 0
      : Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length);

  const isUploading = files.length > 0 && files.some((f) => f.status === "uploading" || f.status === "pending");
  const doneCount = files.filter((f) => f.status === "done").length;

  return { files, overallProgress, isUploading, doneCount, totalCount: files.length, upload, reset };
}
