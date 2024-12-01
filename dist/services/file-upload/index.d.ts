import { Buffer } from "buffer";
import { UploadedFile } from "express-fileupload";
export declare class FileUploadService {
    static getImgBuffer(base64: string): Buffer;
    static uploadImageToS3(imageFile: UploadedFile): Promise<string>;
}
