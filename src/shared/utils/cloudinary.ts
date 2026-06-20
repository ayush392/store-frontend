import { fetcher } from '../../lib/fetcher';
import type { ObjectId } from '../schemas/common.schema';

type Sign = {
  signature: string;
  apiKey: string;
  timestamp: string;
  folder: string;
  uploadPreset: string;
  cloudName: string;
};

const getCloudinarySignature = async (accountId: ObjectId) => {
  const data = await fetcher<Sign>('/cloudinary/signature', 'POST', {
    accountId
  });
  console.log({ signature: data });
  return data;
};

export const cloudinarySignedUpload = async (
  file: File,
  accountId: ObjectId
) => {
  const cloudinarySign = await getCloudinarySignature(accountId);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', cloudinarySign.signature);
  formData.append('api_key', cloudinarySign.apiKey);
  formData.append('timestamp', cloudinarySign.timestamp);
  formData.append('folder', cloudinarySign.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinarySign.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!res.ok) throw new Error('Upload failed');

  const data = await res.json();

  return {
    url: data.secure_url as string,
    publicId: data.public_id as string
  };
};
