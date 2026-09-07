import api from './api';

export const getPresignedUrl = async ({ fileName, contentType, fileSize, purpose = 'report' }) => {
  // We keep this format to not break CreateReport.jsx and ProfilePage.jsx
  return { fileName, contentType, fileSize, purpose };
};

export const uploadFileToS3 = async (file, presigned) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', presigned.purpose || 'report');

  const { data } = await api.post('/uploads/direct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // CreateReport.jsx expects a returned string for publicUrl, or we mutate presigned to have key.
  // Actually CreateReport uses `uploadFileToS3` which returns publicUrl. Then it uses `presigned.key`.
  // Let's mutate presigned.key so the caller has it.
  presigned.key = data.data.key;
  return data.data.publicUrl;
};
