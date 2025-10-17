import { Minimize2 } from "lucide-react";

export default function UploadWidgetHeader() {
  return (
    <div className="flex items-center justify-between w-full p-4 py-2 border-b bg-white/2 border-zinc-800">
      <span className="text-sm font-medium">upload files</span>
      <button>
        <Minimize2 strokeWidth={1.5} className="size-4"/>
      </button>
    </div>
  )
}
