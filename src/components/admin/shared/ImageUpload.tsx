import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, X } from "lucide-react";
import adminApiClient from "@/lib/admin/api-client";
import { toast } from "sonner";

type SingleProps = {
  multiple?: false;
  value?: string;
  onChange: (value: string) => void;
  maxFiles?: number;
};
type MultiProps = {
  multiple: true;
  value?: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
};

type Props = SingleProps | MultiProps;

export function ImageUpload(props: Props) {
  const { multiple = false, maxFiles = 10 } = props as MultiProps;
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setUploading(true);
      try {
        if (multiple) {
          const formData = new FormData();
          acceptedFiles
            .slice(0, maxFiles)
            .forEach((f) => formData.append("files", f));
          const { data } = await adminApiClient.post<
            { url: string }[] | { urls: string[] }
          >("/upload/images", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const urls = Array.isArray(data)
            ? data.map((d) => d.url)
            : data.urls;
          const current = (props as MultiProps).value ?? [];
          (props as MultiProps).onChange([...current, ...urls].slice(0, maxFiles));
          toast.success(`${urls.length} image(s) uploaded`);
        } else {
          const formData = new FormData();
          formData.append("file", acceptedFiles[0]);
          const { data } = await adminApiClient.post<{ url: string }>(
            "/upload/image",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          (props as SingleProps).onChange(data.url);
          toast.success("Image uploaded");
        }
      } finally {
        setUploading(false);
      }
    },
    [multiple, maxFiles, props],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple,
    maxFiles: multiple ? maxFiles : 1,
  });

  const remove = (idx?: number) => {
    if (multiple) {
      const current = (props as MultiProps).value ?? [];
      (props as MultiProps).onChange(current.filter((_, i) => i !== idx));
    } else {
      (props as SingleProps).onChange("");
    }
  };

  const images = multiple
    ? ((props as MultiProps).value ?? [])
    : (props as SingleProps).value
      ? [(props as SingleProps).value as string]
      : [];

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-sm transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-slate-400"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        ) : (
          <>
            <Upload className="mb-2 h-6 w-6 text-slate-400" />
            <p className="text-slate-600">
              {isDragActive ? "Drop images here" : "Click or drag to upload"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {multiple ? `Max ${maxFiles} images` : "Single image"}
            </p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative aspect-square overflow-hidden rounded border border-slate-200 bg-white"
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
              {multiple && i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
