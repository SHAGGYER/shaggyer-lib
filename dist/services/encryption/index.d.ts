import forge from "node-forge";
export declare class EncryptionService {
    static privateKey: string;
    static publicKey: string;
    static rsaKeyPair: forge.pki.rsa.KeyPair;
    static decryptData(encryptedData: string): any;
    static generateEncryptionKeys(publicKeyPath: string, privateKeyPath: string): void;
}
