import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAXVWZH6K4Q7MHLMFD",
    secretAccessKey: "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",
  },
});

export const uploadFileToS3 = async (file, folder) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const params = {
      Bucket: "confirmslot.com",
      Key: `${folder}/${file.name}`,
      Body: arrayBuffer,
      ContentType: file.type,
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    const response = await fetch(url, {
      method: 'PUT',
      body: arrayBuffer,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(params.Bucket,"params.Bucket")
    console.log(params.Key,"params.Key")

    return `https://${params.Bucket}.s3.ap-south-1.amazonaws.com/${params.Key}`;
  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
};