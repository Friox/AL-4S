const crypto = require('crypto-js')

module.exports = {
    encryptStr: (str) => {
        const key = process.env.DB_KEY
        const encrypted = crypto.AES.encrypt(str, key)
        const ciphertext = encrypted.toString()
        return ciphertext
    },
    
    decryptStr: (str) => {
        const key = process.env.DB_KEY
        const bytes = crypto.AES.decrypt(str, key)
        const originalText = bytes.toString(crypto.enc.Utf8)
        return originalText
    }
}