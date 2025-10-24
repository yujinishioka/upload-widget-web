import { CanceledError } from "axios";
import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/shallow";
import { uploadFileToStorage } from "../http/upload-file-to-storage";
import { compressImage } from "../utils/compress-image";

export type Upload = {
  abortController: AbortController;
  compressedSizeInBytes?: number;
  file: File;
  name: string;
  originalSizeInBytes: number;
  remoteUrl?: string;
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
    function updateUpload(uploadId: string, data: Partial<Upload>) {
      const upload = get().uploads.get(uploadId);

      if (!upload) {
        return;
      }

      set((state) => {
        state.uploads.set(uploadId, {
          ...upload,
          ...data,
        });
      });
    }
    
    async function processUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId);

      if (!upload) {
        return;
      }

      try {
        const compressedFile = await compressImage({
          file: upload.file,
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.8,
        });

        updateUpload(uploadId, { compressedSizeInBytes: compressedFile.size });

        const { url } = await uploadFileToStorage(
          {
            file: compressedFile,
            onProgress(sizeInBytes) {
              updateUpload(uploadId, {
                uploadSizeInBytes: sizeInBytes,
              });
            },
          },
          { signal: upload.abortController.signal }
        );

        updateUpload(uploadId, {
          status: "success",
          remoteUrl: url,
        });
      } catch (err) {
        if (err instanceof CanceledError) {
          updateUpload(uploadId, {
            status: "canceled",
          });

          return;
        }

        updateUpload(uploadId, {
          status: "error",
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

export const usePendingUploads = () => {
  return useUploads(
    useShallow((store) => {
      const isThereAnyPendingUploads = Array.from(store.uploads.values()).some(
        (upload) => upload.status === "progress"
      );

      if (!isThereAnyPendingUploads) {
        return { isThereAnyPendingUploads, globalPercentage: 100 };
      }

      const { total, uploaded } = Array.from(store.uploads.values()).reduce(
        (acc, upload) => {
          if (upload.compressedSizeInBytes) {
            acc.uploaded += upload.uploadSizeInBytes;
          }

          acc.total +=
            upload.compressedSizeInBytes || upload.originalSizeInBytes;

          return acc;
        },
        { total: 0, uploaded: 0 }
      );

      const globalPercentage = Math.min(
        Math.round((uploaded * 100) / total),
        100
      );

      return { isThereAnyPendingUploads, globalPercentage };
    })
  );
};