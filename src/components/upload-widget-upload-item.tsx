import * as Progress from "@radix-ui/react-progress";

import { Download, ImageUp, Link2, RefreshCcw, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";

export function UploadWidgetUploadItem() {
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
          <span>screenshot.png</span>
        </span>
        <span className="text-xxs text-zinc-400 flex gap-1.5 items-center">
          <span className="line-through">3MB</span>
          <div className="rounded-full size-1 bg-zinc-700" />
          <div className="flex gap-1">
            <span>300KB</span>
            <span className="text-green-400">-94%</span>
          </div>
          <div className="rounded-full size-1 bg-zinc-700" />
          <span>45%</span>
        </span>
      </div>
      <Progress.Root className="h-1 overflow-hidden rounded-full bg-zinc-800">
        <Progress.Indicator
          className="h-1 bg-indigo-500"
          style={{ width: "43%" }}
        />
      </Progress.Root>
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        <Button size="icon-sm">
          <Download className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Download compressed image</span>
        </Button>
        <Button size="icon-sm">
          <Link2 className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Copy remote URL</span>
        </Button>
        <Button size="icon-sm">
          <RefreshCcw className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Retry upload</span>
        </Button>
        <Button size="icon-sm">
          <X className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Cancel upload</span>
        </Button>
      </div>
    </motion.div>
  );
}
