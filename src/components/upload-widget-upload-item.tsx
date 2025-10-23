import * as Progress from "@radix-ui/react-progress";
import { Download, ImageUp, Link2, RefreshCcw, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { type Upload, useUploads } from "../store/uploads";
import { formatBytes } from "../utils/format-bytes";

interface UploadWidgetUploadItemProps {
  upload: Upload;
  uploadId: string;
}

export function UploadWidgetUploadItem({
  upload,
  uploadId,
}: Readonly<UploadWidgetUploadItemProps>) {
  const cancelUpload = useUploads((store) => store.cancelUpload);
  const progress = Math.min(
    Math.round((upload.uploadSizeInBytes * 100) / upload.originalSizeInBytes),
    100
  );

  return (
    <motion.div
      className="relative flex flex-col gap-3 p-3 overflow-hidden rounded-lg shadow-shape-content bg-white/2"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
      }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1 text-xs font-medium">
          <ImageUp className="size-3 text-zinc-300" strokeWidth={1.5} />
          <span>{upload.name}</span>
        </span>

        <span className="text-xxs text-zinc-400 flex gap-1.5 items-center">
          <span className="line-through">
            {formatBytes(upload.originalSizeInBytes)}
          </span>
          <div className="rounded-full size-1 bg-zinc-700" />
          <div className="flex gap-1">
            <span>300KB</span>
            <span className="text-green-400">-94%</span>
          </div>
          <div className="rounded-full size-1 bg-zinc-700" />
          {upload.status === "success" && <span>100%</span>}
          {upload.status === "progress" && <span>{progress}%</span>}
          {upload.status === "error" && (
            <span className="text-red-400">Error</span>
          )}
          {upload.status === "canceled" && (
            <span className="text-yellow-400">Canceled</span>
          )}
        </span>
      </div>
      <Progress.Root
        value={progress}
        data-status={upload.status}
        className="h-1 overflow-hidden rounded-full bg-zinc-800 group"
      >
        <Progress.Indicator
          className="bg-indigo-500 h-1 group-data-[status=success]:bg-green-400 group-data-[status=error]:bg-red-400 group-data-[status=canceled]:bg-yellow-400 transition-all"
          style={{
            width: upload.status === "progress" ? `${progress}%` : "100%",
          }}
        />
      </Progress.Root>
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        <Button size="icon-sm" disabled={upload.status !== "success"}>
          <Download className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Download compressed image</span>
        </Button>

        <Button size="icon-sm" disabled={upload.status !== "success"}>
          <Link2 className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Copy remote URL</span>
        </Button>
        
        <Button
          disabled={!["canceled", "error"].includes(upload.status)}
          size="icon-sm"
        >
          <RefreshCcw className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Retry upload</span>
        </Button>
        
        <Button
          disabled={upload.status !== "progress"}
          size="icon-sm"
          onClick={() => cancelUpload(uploadId)}
        >
          <X className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Cancel upload</span>
        </Button>
      </div>
    </motion.div>
  );
}
