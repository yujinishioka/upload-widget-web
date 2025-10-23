import { UploadWidgetUploadItem } from "./upload-widget-upload-item";
import { useUploads } from "../store/uploads";

export function UploadWidgetUploadList() {
  const uploads = useUploads((store) => store.uploads);
  const isUploadListEmpty = uploads.size === 0;
  
  return (
    <div className="flex flex-col gap-3 px-3">
      <span className="text-xs font-medium">
        Uploaded files <span className="text-zinc-400">{uploads.size}</span>
      </span>
      {isUploadListEmpty ? (
        <span className="text-xs text-zinc-400">No uploads added</span>
      ) : (
        <div className="flex flex-col gap-2">
          {Array.from(uploads).map(([uploadId, upload]) => {
            return (
              <UploadWidgetUploadItem
                key={uploadId}
                upload={upload}
                uploadId={uploadId}
              />
            );
          })}
        </div>
      )}
    </div>
  )
}
