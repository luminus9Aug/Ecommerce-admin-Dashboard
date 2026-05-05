import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, Link, X, Loader2 } from "lucide-react";
import { categoryAdapter } from "@/lib/api/adapters/CategoryAdapter";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  /** Optional small preview size. Defaults to 80px */
  previewSize?: number;
}

/**
 * Dual-mode image input:
 *  - Tab 1: Paste a URL (Cloudinary / any external URL)
 *  - Tab 2: Upload a file — posts multipart to /uploads, returns a Cloudinary URL
 */
export function ImageUploader({
  value,
  onChange,
  folder = "products",
  label = "Image",
  previewSize = 80,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await categoryAdapter.uploadFile(file, folder);
      onChange(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed — check file type/size (max 10MB, PNG/JPG/WebP)");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Tabs defaultValue="url">
        <TabsList className="h-8 text-xs">
          <TabsTrigger value="url" className="text-xs px-3">
            <Link className="h-3 w-3 mr-1" /> URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs px-3">
            <Upload className="h-3 w-3 mr-1" /> Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-2">
          <Input
            placeholder="https://res.cloudinary.com/..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, WebP · max 10MB
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {value && (
        <div className="relative inline-block mt-2">
          <img
            src={value}
            alt="preview"
            style={{ width: previewSize, height: previewSize }}
            className="rounded object-cover border border-border"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5 hover:opacity-80 transition"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
