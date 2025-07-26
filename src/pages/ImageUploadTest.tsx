import React from 'react';
import { ImageUploader } from '@/components/ImageUploader';

const ImageUploadTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Asset Upload Test</h1>
          <p className="text-muted-foreground">
            Upload the heart terrarium image for the authentication page background.
          </p>
        </div>
        
        <ImageUploader />
        
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Upload the heart terrarium image using the form above</li>
            <li>Save the same image file as <code className="bg-muted px-1 rounded">goodable-heart-terrarium.png</code> in the <code className="bg-muted px-1 rounded">/public</code> directory</li>
            <li>Visit <code className="bg-muted px-1 rounded">/auth</code> to see the background</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadTest;