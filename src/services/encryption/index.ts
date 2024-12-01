import forge from "node-forge";
import fs from "fs";

export class EncryptionService {
  public static privateKey: string;
  public static publicKey: string;
  public static rsaKeyPair: forge.pki.rsa.KeyPair;

  public static decryptData(encryptedData: string) {
    try {
      // Parse the private key from PEM format
      const privateKey = forge.pki.privateKeyFromPem(this.privateKey);

      // Decode the Base64-encoded encrypted data
      const encryptedBytes = forge.util.decode64(encryptedData);

      // Decrypt the data using RSA private key
      const decryptedData = privateKey.decrypt(encryptedBytes, "RSA-OAEP");

      return decryptedData;
    } catch (error) {
      console.error("Decryption error:", error);
      throw error;
    }
  }

  public static generateEncryptionKeys() {
    try {
      // Try to read existing keys from disk
      const publicKey = fs.readFileSync("../client/public/public.pem", "utf8");
      const privateKey = fs.readFileSync("./private.pem", "utf8");

      // If keys are successfully loaded, set them in the class
      this.publicKey = publicKey;
      this.privateKey = privateKey;
    } catch (error) {
      // If keys don't exist on disk, generate new ones
      const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);

      fs.writeFileSync("../client/public/public.pem", publicKeyPem, "utf8");
      fs.writeFileSync("./private.pem", privateKeyPem, "utf8");

      // Set the keys in the class
      this.publicKey = publicKeyPem;
      this.privateKey = privateKeyPem;
    }
  }
}
