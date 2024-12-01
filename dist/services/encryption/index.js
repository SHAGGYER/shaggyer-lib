"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const node_forge_1 = __importDefault(require("node-forge"));
const fs_1 = __importDefault(require("fs"));
class EncryptionService {
    static privateKey;
    static publicKey;
    static rsaKeyPair;
    static decryptData(encryptedData) {
        try {
            // Parse the private key from PEM format
            const privateKey = node_forge_1.default.pki.privateKeyFromPem(this.privateKey);
            // Decode the Base64-encoded encrypted data
            const encryptedBytes = node_forge_1.default.util.decode64(encryptedData);
            // Decrypt the data using RSA private key
            const decryptedData = privateKey.decrypt(encryptedBytes, "RSA-OAEP");
            return decryptedData;
        }
        catch (error) {
            console.error("Decryption error:", error);
            throw error;
        }
    }
    static generateEncryptionKeys(publicKeyPath, privateKeyPath) {
        try {
            // Try to read existing keys from disk
            const publicKey = fs_1.default.readFileSync(publicKeyPath, "utf8");
            const privateKey = fs_1.default.readFileSync(privateKeyPath, "utf8");
            // If keys are successfully loaded, set them in the class
            this.publicKey = publicKey;
            this.privateKey = privateKey;
            console.info("Encryption keys loaded from disk.");
        }
        catch (error) {
            // If keys don't exist on disk, generate new ones
            console.info("Encryption keys not found on disk. Generating new keys...");
            const rsaKeyPair = node_forge_1.default.pki.rsa.generateKeyPair({ bits: 2048 });
            const publicKeyPem = node_forge_1.default.pki.publicKeyToPem(rsaKeyPair.publicKey);
            const privateKeyPem = node_forge_1.default.pki.privateKeyToPem(rsaKeyPair.privateKey);
            fs_1.default.writeFileSync(publicKeyPath, publicKeyPem, "utf8");
            fs_1.default.writeFileSync(privateKeyPath, privateKeyPem, "utf8");
            // Set the keys in the class
            this.publicKey = publicKeyPem;
            this.privateKey = privateKeyPem;
            console.info("New encryption keys generated and saved to disk.");
        }
    }
}
exports.EncryptionService = EncryptionService;
