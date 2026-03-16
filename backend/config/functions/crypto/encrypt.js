const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
let publicKey;

module.exports = (plaintext) => {
  if (!publicKey) {
    console.log("loading public key");

    try {
      publicKey = fs.readFileSync(
        path.resolve(__dirname, "public_key.pem"),
        "utf8"
      );
    } catch (error) {
      if (error?.code === "ENOENT") {
        throw new Error("No public key found!");
      } else {
        throw error;
      }
    }
  }
  return crypto
    .publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(String(plaintext))
    )
    .toString("base64");
};
