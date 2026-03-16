'use strict';

/**
 * crypto service
 */
const crypto = require("crypto");
const { createHmac, createCipheriv, createDecipheriv, randomBytes } = require('crypto');
const IV_LENGTH = 16;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""; // hex key 32 bytes
const isProlificEmail = (identifier) => {
    return /^[a-f\d]{24}@email\.prolific\.co$/.test(identifier);
};
const isQualtricsPid = (identifier) => {
    return /^.*@qualtrics$/.test(identifier);
};
const isEmail = (identifier) => {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(identifier);
}
const getProvider = (email) => {
    switch(true) {
        case isProlificEmail(email):
            return "prolific"
        case isQualtricsPid(email):
            return "qualtrics"
        case isEmail(email):
            return "email"
        default:
            return null
    }
};

const createKeyedHash = (message) => {
    return createHmac("sha3-256", process.env.USER_EMAIL_HMAC_KEY)
        .update(message)
        .digest("hex")
}
module.exports = () => ({
    async createHash(message) {
        if (!message) return message;
        const data = new TextEncoder().encode(message)
        const hash = await crypto.subtle.digest("SHA-256", data)
        return Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .toString()
    },
    createKeyedHash,
    hashEmail(email) {
        let emailHashed;
        const provider = getProvider(email)
        if (provider === "email") {
            emailHashed = createKeyedHash(email);
        } else if (["prolific", "qualtrics"].includes(provider)) {
            // we need to keep the prolific IDs so we can invite participants to answer
            // the survey using Prolific
            emailHashed = email;
            console.log("hashEmail", email, emailHashed)

        }

        return emailHashed;
    },
    getProvider,
    encryptSym(plaintext) {
        if(!plaintext) return plaintext;
        try {
            const iv = randomBytes(IV_LENGTH);
            const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
            return Buffer.concat(
                [iv, cipher.update(plaintext), cipher.final()]
            ).toString("base64");
        } catch (error) {
            console.error("Encryption failed:", error);
            return null;
        }
    },
    decryptSym(value) {
        if (!value) return value;
        try {
            const buffer = Buffer.from(value, "base64");
            const iv = buffer.subarray(0, IV_LENGTH);
            const encryptedText = buffer.subarray(IV_LENGTH);
            const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

            return Buffer.concat(
                [decipher.update(encryptedText), decipher.final()]
            ).toString('utf-8');
        } catch (error) {
            console.error("Decryption failed:", error);
            return null;
        }
    }
});
