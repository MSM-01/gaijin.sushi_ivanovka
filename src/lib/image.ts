const MAX_UPLOAD_BYTES = 900_000;

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('image-decode');
  }

  try {
    const longestSide = Math.max(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');

    for (const maxSide of [1000, 800, 640]) {
      const scale = Math.min(1, maxSide / longestSide);
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('image-canvas');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const type of ['image/webp', 'image/jpeg']) {
        for (const quality of [0.82, 0.72, 0.62, 0.52]) {
          const blob = await canvasBlob(canvas, type, quality);
          if (!blob || blob.type !== type) break;
          if (blob.size <= MAX_UPLOAD_BYTES) return blob;
        }
      }
    }
  } finally {
    bitmap.close();
  }

  throw new Error('image-too-large');
}
