/**
 * Utility untuk mengompresi gambar dari upload pengguna agar hemat memori
 * dan aman disimpan ke dalam localStorage (dibawah batas 5MB browser).
 */
export const compressImage = (
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung rasio aspek
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Gambar ke canvas dengan ukuran optimal
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor sebagai data URL JPEG terkompresi
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        reject(new Error('Gagal membaca gambar: ' + err));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => {
      reject(new Error('Gagal membaca file: ' + err));
    };

    reader.readAsDataURL(file);
  });
};
