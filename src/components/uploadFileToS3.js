// import {
//   S3Client,
//   PutObjectCommand
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const REGION = "ap-south-1"; // your region
// const BUCKET = "confirmslot.com";

// const s3Client = new S3Client({
//   region: REGION,
//   credentials: {
//     accessKeyId: "AKIAXVWZH6K4Q7MHLMFD",     // ❗ Exposing these in frontend is risky
//     secretAccessKey: "g6R0VAzaCQeXD3RPy+MaYAhdUfRgftQfKQIJhEP/"
//   }
// });

// export const uploadFileToS3 = async (file, username) => {
//   const key = `${username}/${Date.now()}_${file.name}`;

//   const command = new PutObjectCommand({
//     Bucket: BUCKET,
//     Key: key,
//     Body: file,
//     ContentType: file.type,
//     ACL: "public-read"
//   });

//   try {
//     await s3Client.send(command);
//     return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
//   } catch (err) {
//     console.error("S3 Upload Error:", err);
//     return null;
//   }
// };


import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: "ap-south-1", // e.g., 'us-east-1'
  credentials: {
    accessKeyId: "AKIAXVWZH6K4Q7MHLMFD",
    secretAccessKey: "g6R0VAzaCQeXD3RPy+MaYAhdUfRgftQfKQIJhEP/",
  },
});

export const uploadFileToS3 = async (file, folder) => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Generate a unique key for the file (e.g., logos/timestamp_filename.jpg)
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const key = `${folder}/${fileName}`; // e.g., logos/1634567890_image.jpg

  try {
    // Convert File to ArrayBuffer for browser compatibility
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const params = {
      Bucket: "confirmslot.com", // e.g., 'confirm-slot-bucket'
      Key: key,
      Body: buffer,
      ContentType: file.type, // e.g., 'image/jpeg'
      ACL: 'public-read', // Optional: makes the file publicly accessible
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Construct the S3 URL
    const fileUrl = `https://${params.Bucket}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${key}`;
    return fileUrl;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw error;
  }
};