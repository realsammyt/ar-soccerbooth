import type { UploadResult } from '../types';

// GCS Configuration - to be set from environment/config
const GCS_CONFIG = {
  bucketName: process.env.GCS_BUCKET_NAME || 'ar-soccerbooth-photos',
  uploadEndpoint: process.env.GCS_UPLOAD_ENDPOINT || '/api/upload', // For web, use a proxy endpoint
};

interface PhotoMetadata {
  timestamp: number;
  kioskId: string;
}

/**
 * Generate unique filename for photo
 */
function generateFilename(timestamp: number, kioskId: string): string {
  const date = new Date(timestamp);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toISOString().split('T')[1].replace(/[:.]/g, '-').slice(0, 8); // HH-MM-SS
  const uuid = crypto.randomUUID().slice(0, 8);
  return `photos/${dateStr}/${kioskId}-${timeStr}-${uuid}.jpg`;
}

/**
 * Upload photo to Google Cloud Storage
 * In Electron, this uses the GCS Node.js client directly
 * In web, this would proxy through a backend endpoint
 */
export async function uploadToGCS(
  blob: Blob,
  metadata: PhotoMetadata
): Promise<UploadResult> {
  const filename = generateFilename(metadata.timestamp, metadata.kioskId);

  try {
    // Check if running in Electron with direct GCS access
    if (typeof window !== 'undefined' && (window as any).electronAPI?.uploadToGCS) {
      // Electron: Use IPC to main process
      const arrayBuffer = await blob.arrayBuffer();
      const result = await (window as any).electronAPI.uploadToGCS({
        data: Array.from(new Uint8Array(arrayBuffer)),
        filename,
        contentType: 'image/jpeg',
        metadata,
      });
      return result;
    }

    // Web: Use fetch to upload endpoint (requires backend proxy)
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(GCS_CONFIG.uploadEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      publicUrl: result.publicUrl,
      shortUrl: result.shortUrl || result.publicUrl,
      objectPath: filename,
    };

  } catch (error) {
    console.error('GCS upload error:', error);
    return {
      success: false,
      publicUrl: '',
      shortUrl: '',
      objectPath: filename,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Get public URL for a GCS object
 */
export function getPublicUrl(objectPath: string): string {
  return `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${objectPath}`;
}
