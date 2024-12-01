"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const buffer_1 = require("buffer");
const uuid_1 = require("uuid");
const client_s3_1 = require("@aws-sdk/client-s3");
const AWS_REGION = "eu-central-1";
class FileUploadService {
    static getImgBuffer(base64) {
        const base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");
        return buffer_1.Buffer.from(base64Data, "base64");
    }
    static async uploadImageToS3(imageFile) {
        const filename = "sw-" + (0, uuid_1.v4)() + ".jpeg";
        const bucketName = "files.swaiez.com";
        const s3 = new client_s3_1.S3Client({
            region: AWS_REGION,
            endpoint: `https://s3.${AWS_REGION}.amazonaws.com`,
        });
        const params = {
            Bucket: bucketName,
            Key: filename,
            Body: imageFile.data,
            ContentType: "image/jpeg",
        };
        await s3.send(new client_s3_1.PutObjectCommand(params));
        return `https://s3.${AWS_REGION}.amazonaws.com/${bucketName}/${filename}`;
    }
}
exports.FileUploadService = FileUploadService;
