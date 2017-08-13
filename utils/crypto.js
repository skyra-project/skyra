const crypto = require('crypto');
const algorithm = 'aes-192-ctr';
const password = 'kSny-ES+98';

class Crypto {

    static encrypt(text) {
        const cipher = crypto.createCipher(algorithm, password);
        return cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
    }

    static decrypt(text) {
        const decipher = crypto.createDecipher(algorithm, password);
        return decipher.update(text, 'base64', 'utf8') + decipher.final('utf8');
    }

}

module.exports = Crypto;
