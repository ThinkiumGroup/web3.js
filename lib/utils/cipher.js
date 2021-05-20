const createKeccakHash = require('keccak');
const secp256k1 = require('secp256k1');
const ethjsUtil = require('ethjs-util');
const assert = require('assert');

/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param v the value
 */
function toBuffer(v) {
    if (!Buffer.isBuffer(v)) {
        if (Array.isArray(v)) {
            v = Buffer.from(v);
        } else if (typeof v === 'string') {
            if (ethjsUtil.isHexString(v)) {
                v = Buffer.from(ethjsUtil.padToEven(ethjsUtil.stripHexPrefix(v)), 'hex');
            } else {
                v = Buffer.from(v);
            }
        } else if (typeof v === 'number') {
            v = ethjsUtil.intToBuffer(v);
        } else if (v === null || v === undefined) {
            v = Buffer.allocUnsafe(0);
        } else if (BN.isBN(v)) {
            v = v.toArrayLike(Buffer);
        } else if (v.toArray) {
            // converts a BN to a Buffer
            v = Buffer.from(v.toArray());
        } else {
            throw new Error('invalid type');
        }
    }
    return v;
}

/**
 * Returns the thk public key of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
function privateToPublic(privateKey) {
    privateKey = toBuffer(privateKey);
    // skip the type flag and use the X, Y points
    return secp256k1.publicKeyCreate(privateKey, false);
}


/**
 * Returns the thk address of a given public key.
 * Accepts "thk public keys" and SEC1 encoded keys.
 * @param pubKey The two points of an uncompressed key, unless sanitize is enabled
 * @param sanitize Accept public keys in other formats
 */
function publicToAddress(pubKey, sanitize) {
    if (sanitize === void 0) {
        sanitize = false;
    }
    pubKey = toBuffer(pubKey);
    if (sanitize && pubKey.length !== 64) {
        pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1);
    }
    assert(pubKey.length === 64);
    // Only take the lower 160bits of the hash
    return hash256Buffer(pubKey).slice(-20);
}

/**
 * Returns the thk address of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
function privateToAddress(privateKey) {
    return publicToAddress(privateToPublic(privateKey).slice(1));
}

/**
 * @param value
 * @param options
 * @returns string
 */
function hash256(value, options) {
    if (options && options.encoding === 'hex') {
        if (value.length > 2 && value.substr(0, 2) === '0x') {
            value = value.substr(2);
        }
        value = Buffer.from(value, 'hex');
    }
    return createKeccakHash("keccak256").update(value).digest().toString('hex');
}

/**
 * @param value Buffer
 * @returns Buffer
 */
function hash256Buffer(value) {
    return createKeccakHash("keccak256").update(value).digest();
}

/**
 * @param msgHash Buffer
 * @param privateKey Buffer
 * @returns {string}
 */
function sign(msgHash, privateKey) {
    const sig = secp256k1.sign(msgHash, privateKey);
    return "0x" + sig.signature.slice(0, 64).toString('hex') + (sig.recovery + 27).toString(16);
}

function verify(hash, signature, publicKey) {
    if (typeof hash !== 'string') {
        return false;
    }
    if (typeof signature !== 'string') {
        return false;
    }
    if (typeof publicKey !== 'string') {
        return false;
    }
    return secp256k1.verify(
        new Buffer.from(ethjsUtil.stripHexPrefix(hash), 'hex'),
        new Buffer.from(ethjsUtil.stripHexPrefix(signature), 'hex').slice(0, 64),
        new Buffer.from(ethjsUtil.stripHexPrefix(publicKey), 'hex'));
}

function nodeSign(msgHash, privateKey) {
    const sig = secp256k1.sign(msgHash, privateKey);
    let v = (sig.recovery + 27);
    let sig_v = v.toString(16) == '1b' ? '00' : v.toString(16) == '1c' ? '01' : v.toString(16);
    return sig.signature.slice(0, 64).toString('hex') + sig_v;
}

module.exports = {
    secp256k1,
    toBuffer,
    privateToPublic,
    publicToAddress,
    privateToAddress,
    hash256,
    hash256Buffer,
    sign,
    verify,
    nodeSign,
};
