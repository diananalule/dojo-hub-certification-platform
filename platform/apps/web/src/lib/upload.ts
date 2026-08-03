import { StoredFileKind } from '@dojo-hub/shared';
import { api } from './api-client';

export async function uploadFile(
  file: File,
  kind: StoredFileKind,
  onProgress?: (pct: number) => void,
): Promise<{ id: string; url: string; originalName: string; sizeBytes: number; mimeType: string; kind: StoredFileKind }> {
  const { storageKey, uploadUrl } = await api.post<{ storageKey: string; uploadUrl: string; publicUrl: string }>('/files/presign', {
    originalName: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    kind,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });

  return api.post('/files', {
    storageKey,
    originalName: file.name,
    sizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
    kind,
  });
}
