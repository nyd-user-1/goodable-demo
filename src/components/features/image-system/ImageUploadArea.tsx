import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  assetId?: string;
}

interface ImageUploadAreaProps {
  onUploadComplete?: () => void;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const extractImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadToSupabase = async (file: File, uploadId: string) => {
    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadId ? { ...f, status: 'uploading' } : f
      ));

      // Extract image dimensions
      const dimensions = await extractImageDimensions(file);

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('goodable-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('goodable-assets')
        .getPublicUrl(fileName);

      // Create database record
      const { data: assetData, error: dbError } = await supabase
        .from('assets')
        .insert({
          name: file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-'),
          original_name: file.name,
          url: publicUrl,
          type: 'image',
          mime_type: file.type,
          size_bytes: file.size,
          width: dimensions.width,
          height: dimensions.height,
          tags: ['blog-image'],
          uploaded_by: user?.id,
          metadata: {
            storage_path: fileName
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update status to success
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadId 
          ? { ...f, status: 'success', progress: 100, assetId: assetData.id } 
          : f
      ));

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Update status to error
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadId 
          ? { ...f, status: 'error', error: error.message } 
          : f
      ));

      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images.",
        variant: "destructive"
      });
      return;
    }

    // Create upload entries
    const newUploads: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadFiles(prev => [...prev, ...newUploads]);
    setIsUploading(true);

    // Upload files sequentially
    for (const upload of newUploads) {
      await uploadToSupabase(upload.file, upload.id);
    }

    setIsUploading(false);
    onUploadComplete?.();
  }, [user, toast, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif', '.svg']
    },
    multiple: true
  });

  const removeFile = (uploadId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== uploadId));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={cn(
            "rounded-full p-3 transition-colors",
            isDragActive ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-8 w-8",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to select files
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, WebP, AVIF, SVG (max 10MB each)
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Upload Queue</h4>
            {uploadFiles.some(f => f.status === 'success') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                className="text-xs"
              >
                Clear completed
              </Button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadFiles.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex-shrink-0">
                  {upload.status === 'pending' && (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                  {upload.status === 'uploading' && (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  )}
                  {upload.status === 'success' && (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} className="mt-1 h-1" />
                  )}
                  {upload.error && (
                    <p className="text-xs text-destructive mt-1">{upload.error}</p>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(upload.id)}
                  className="flex-shrink-0"
                  disabled={upload.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};