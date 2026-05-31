/**
 * lib/crypto_vault.js - AI Supreme Cryptographic Standard
 * Implements AES-256-GCM encryption, Key Derivation, and Asymmetric Signing.
 */
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

class CryptoVault {
    /**
     * Derives a cryptographic key from a master password.
     */
    static deriveKey(password, salt) {
        return crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha512');
    }

    /**
     * Encrypts a plaintext string using AES-256-GCM.
     */
    static encrypt(text, masterKey) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const salt = crypto.randomBytes(SALT_LENGTH);
        const key = this.deriveKey(masterKey, salt);
        
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        // Bundle: salt:iv:tag:encrypted
        return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypts an encrypted bundle.
     */
    static decrypt(bundle, masterKey) {
        const [saltHex, ivHex, tagHex, encrypted] = bundle.split(':');
        
        const salt = Buffer.from(saltHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const key = this.deriveKey(masterKey, salt);
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * Generates a new P-256 (ECDSA) key pair for Sovereign Command.
     */
    static generateSovereignKeyPair() {
        return crypto.generateKeyPairSync('ec', {
            namedCurve: 'prime256v1',
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
    }

    /**
     * Verifies an ECDSA signature.
     */
    static verifySignature(data, signature, publicKey) {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        verify.end();
        return verify.verify(publicKey, signature, 'base64');
    }
}

module.exports = CryptoVault;
