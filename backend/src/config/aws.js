import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

// Returns a pre-signed URL to upload directly from the client
export const getUploadUrl = async (key, contentType, expiresIn = 300) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
};

// Returns a pre-signed URL to download a private asset
export const getDownloadUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
};

export const deleteObject = (key) =>
  s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

export const buildPublicUrl = (key) =>
  `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
