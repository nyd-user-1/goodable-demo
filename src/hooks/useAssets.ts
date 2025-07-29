import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Asset {
  id: string;
  name: string;
  original_name: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  mime_type: string;
  size_bytes: number;
  alt_text?: string;
  caption?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export const useAssets = (filters?: {
  type?: Asset['type'];
  name?: string;
  uploadedBy?: string;
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('assets').select('*');

        // Apply filters
        if (filters?.type) {
          query = query.eq('type', filters.type);
        }
        if (filters?.name) {
          query = query.eq('name', filters.name);
        }
        if (filters?.uploadedBy) {
          query = query.eq('uploaded_by', filters.uploadedBy);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setAssets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [filters?.type, filters?.name, filters?.uploadedBy]);

  const uploadAsset = async (file: File, metadata?: Record<string, any>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Extract image dimensions for images
      let dimensions = {};
      if (file.type.startsWith('image/')) {
        try {
          dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
        } catch (err) {
          console.warn('Could not extract image dimensions:', err);
        }
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

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
      const assetData = {
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        original_name: file.name,
        url: publicUrl,
        type: file.type.startsWith('image/') ? 'image' as const : 
              file.type.startsWith('video/') ? 'video' as const : 
              file.type.startsWith('audio/') ? 'audio' as const : 'document' as const,
        mime_type: file.type,
        size_bytes: file.size,
        ...(dimensions as any), // Add width/height if available
        tags: ['blog-image'],
        uploaded_by: user.id,
        metadata: {
          storage_path: fileName,
          alt_text: metadata?.alt_text || '',
          caption: metadata?.caption || '',
          usage: metadata?.usage || ['blog'],
          tags: metadata?.tags || ['blog'],
          ...metadata
        }
      };

      const { data, error } = await supabase
        .from('assets')
        .insert(assetData)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAssets(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upload asset');
    }
  };

  const deleteAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      // Update local state
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete asset');
    }
  };

  return {
    assets,
    loading,
    error,
    uploadAsset,
    deleteAsset,
    refetch: () => {
      // Trigger a re-fetch by updating the effect dependencies
      setLoading(true);
    }
  };
};

// Hook for getting a single asset by name
export const useAsset = (name: string) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!name) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('assets')
          .select('*')
          .eq('name', name)
          .single();

        if (fetchError) throw fetchError;

        setAsset(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch asset');
        setAsset(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [name]);

  return { asset, loading, error };
};