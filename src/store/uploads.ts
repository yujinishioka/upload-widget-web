import { CanceledError } from "axios";
import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { uploadFileToStorage } from "../http/upload-file-to-storage";

export type Upload = {
  abortController: AbortController;
  file: File;
  name: string;
  originalSizeInBytes: number;
  status: "progress" | "success" | "error" | "canceled";
  uploadSizeInBytes: number;
};

type UploadState = {
  addUploads: (files: File[]) => void;
  cancelUpload: (uploadId: string) => void;
  uploads: Map<string, Upload>;
};

enableMapSet();

export const useUploads = create<UploadState, [["zustand/immer", never]]>(
  immer((set, get) => {
    async function processUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId);

      if (!upload) {
        return;
      }

      try {
        await uploadFileToStorage(
          {
            file: upload.file,
            onProgress(sizeInBytes) {
              set((state) => {
                state.uploads.set(uploadId, {
                  ...upload,
                  uploadSizeInBytes: sizeInBytes,
                });
              });
            },
          },
          { signal: upload.abortController.signal }
        );

        set((state) => {
          state.uploads.set(uploadId, {
            ...upload,
            status: "success",
          });
        });
      } catch (err) {
        if (err instanceof CanceledError) {
          set((state) => {
            state.uploads.set(uploadId, {
              ...upload,
              status: "canceled",
            });
          });

          return;
        }
        set((state) => {
          state.uploads.set(uploadId, {
            ...upload,
            status: "error",
          });
        });
      }
    }

    function cancelUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId);

      if (!upload) {
        return;
      }

      upload.abortController.abort();

      set((state) => {
        state.uploads.set(uploadId, {
          ...upload,
          status: "canceled",
        });
      });
    }

    function addUploads(files: File[]) {
      for (const file of files) {
        const uploadId = crypto.randomUUID();
        const abortController = new AbortController();

        const upload: Upload = {
          abortController,
          file,
          name: file.name,
          originalSizeInBytes: file.size,
          status: "progress",
          uploadSizeInBytes: 0,
        };

        set((state) => {
          state.uploads.set(uploadId, upload);
        });
        
        processUpload(uploadId);
      }
    }

    return {
      uploads: new Map(),
      addUploads,
      cancelUpload,
    };
  })
);
