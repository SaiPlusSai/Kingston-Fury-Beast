// Integration helpers for CreateReport - imported by CreateReport.jsx
import { createReport } from '../../services/reportsApi';
import { getPresignedUrl, uploadFileToS3 } from '../../services/uploadsApi';
import { PRIORITY_TO_API } from '../../utils/reportFormatters';

export const submitReport = async ({ form, selectedCat, files, coords }) => {
  let imageUrl = null;
  const imageKeys = [];

  if (files?.length > 0) {
    const file = files[0];
    const presigned = await getPresignedUrl({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    });
    imageUrl = await uploadFileToS3(file, presigned);
    if (presigned.key) imageKeys.push(presigned.key);
  }

  return createReport({
    title: form.title,
    category: selectedCat,
    description: form.description,
    latitude: coords.latitude,
    longitude: coords.longitude,
    location: form.location,
    priority: PRIORITY_TO_API[form.priority] || undefined,
    imageUrl,
    imageKeys,
  });
};

export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no disponible'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => reject(new Error('No se pudo obtener la ubicación GPS')),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  });
