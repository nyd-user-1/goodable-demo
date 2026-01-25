import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2, CheckCircle } from 'lucide-react';

export const ImageUploader: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // For now, we'll create a data URL since we don't have Supabase Storage set up
      // In production, you'd upload to Supabase Storage and get a real URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        try {
          // First, check if the asset already exists
          const { data: existingAsset } = await supabase
            .from('assets')
            .select('id')
            .eq('name', 'goodable-heart-terrarium')
            .single();

          if (existingAsset) {
            // Update existing asset
            const { error } = await supabase
              .from('assets')
              .update({
                original_name: file.name,
                url: `/goodable-heart-terrarium.png`, // Use public path for now
                mime_type: file.type,
                size_bytes: file.size,
                alt_text: 'Beautiful heart-shaped terrarium with NYSgpt branding in a greenhouse setting',
                caption: 'Heart terrarium background for authentication page',
                updated_at: new Date().toISOString(),
                metadata: {
                  usage: ['auth_background'],
                  tags: ['background', 'heart', 'terrarium', 'brand'],
                  uploaded_via: 'image_uploader_component'
                }
              })
              .eq('id', existingAsset.id);

            if (error) throw error;
          } else {
            // Create new asset
            const { error } = await supabase
              .from('assets')
              .insert({
                name: 'goodable-heart-terrarium',
                original_name: file.name,
                url: `/goodable-heart-terrarium.png`, // Use public path for now
                type: 'image',
                mime_type: file.type,
                size_bytes: file.size,
                alt_text: 'Beautiful heart-shaped terrarium with NYSgpt branding in a greenhouse setting',
                caption: 'Heart terrarium background for authentication page',
                uploaded_by: user.id,
                metadata: {
                  usage: ['auth_background'],
                  tags: ['background', 'heart', 'terrarium', 'brand'],
                  uploaded_via: 'image_uploader_component'
                }
              });

            if (error) throw error;
          }

          setUploadSuccess(true);
          toast({
            title: "Success!",
            description: "Heart terrarium image uploaded successfully. You can now save the image file as 'goodable-heart-terrarium.png' in the public directory.",
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the image.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please sign in to upload the heart terrarium image.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Heart Terrarium Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload the beautiful heart terrarium image to use as the authentication page background.
        </p>
        
        {uploadSuccess ? (
          <div className="text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <p className="text-sm font-medium text-green-700">
              Image uploaded successfully!
            </p>
            <p className="text-xs text-muted-foreground">
              The database record is ready. Now save the image file as 'goodable-heart-terrarium.png' in the public directory.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing image...
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>• Select the heart terrarium image file</p>
              <p>• This will create/update the database record</p>
              <p>• You'll still need to save the file to the public directory</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};