import forge from "node-forge";
import fs from "fs";
import path from "path";

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

  public static generateEncryptionKeys(
    publicKeyPath: string,
    privateKeyPath: string
  ) {
    try {
      // Try to read existing keys from disk

      const publicKey = fs.readFileSync(publicKeyPath, "utf8");
      const privateKey = fs.readFileSync(privateKeyPath, "utf8");

      // If keys are successfully loaded, set them in the class
      this.publicKey = publicKey;
      this.privateKey = privateKey;

      console.info("Encryption keys loaded from disk.");
    } catch (error) {
      // If keys don't exist on disk, generate new ones
      console.info("Encryption keys not found on disk. Generating new keys...");

      const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);

      fs.writeFileSync(publicKeyPath, publicKeyPem, "utf8");
      fs.writeFileSync(privateKeyPath, privateKeyPem, "utf8");

      // Set the keys in the class
      this.publicKey = publicKeyPem;
      this.privateKey = privateKeyPem;

      console.info("New encryption keys generated and saved to disk.");
    }
  }
}
