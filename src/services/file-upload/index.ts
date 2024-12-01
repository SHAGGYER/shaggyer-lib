import { Buffer } from "buffer";
import { v4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { S3Client as S3, PutObjectCommand } from "@aws-sdk/client-s3";
const AWS_REGION = "eu-central-1";

export class FileUploadService {
  static getImgBuffer(base64: string) {
    const base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");
    return Buffer.from(base64Data, "base64");
  }

  static async uploadImageToS3(imageFile: UploadedFile) {
    const filename = "sw-" + v4() + ".jpeg";

    const bucketName = "files.swaiez.com";
    const s3 = new S3({
      region: AWS_REGION,
      endpoint: `https://s3.${AWS_REGION}.amazonaws.com`,
    });

    const params = {
      Bucket: bucketName,
      Key: filename,
      Body: imageFile.data,
      ContentType: "image/jpeg",
    };
    await s3.send(new PutObjectCommand(params));
    return `https://s3.${AWS_REGION}.amazonaws.com/${bucketName}/${filename}`;
  }
}
