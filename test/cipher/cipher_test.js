#!/usr/bin/env node
const testEnv = require('../common/env-test');
const cipher = require('../../lib/utils/cipher');
const web3 = testEnv.web3;

const bip39 = require('bip39');
const hdkey = require('hdkey');

describe('test-cipher', function () {
    this.timeout(100000);
    it('hash', done => {
        let signStr = "1-f167a1c5c5fab6bddca66118216817af3fa86827-5dfcfc6f4b48f93213dad643a50228ff873c15b9-853-0-10000000000000000000000--7b22676173223a363030303030307d";
        let hash = cipher.hash256(signStr);
        console.log(hash)
        done()
    });

    it('gen key', done => {
        let mnemonic = bip39.generateMnemonic();
        console.log(mnemonic);

        let seed = bip39.mnemonicToSeedSync(mnemonic);
        let hdWallet = hdkey.fromMasterSeed(seed);
        let privateKey = hdWallet._privateKey;
        console.log(privateKey.toString('hex'));

        console.log(cipher.privateToPublic(privateKey).toString('hex'));
        console.log(cipher.privateToAddress(privateKey).toString('hex'));

        done()
    });

    it('gen key2', done => {
        let mnemonic = 'toddler opinion resource deal aerobic bind badge flame screen pepper ginger general';
        console.log(mnemonic);

        let seed = bip39.mnemonicToSeedSync(mnemonic);
        let hdWallet = hdkey.fromMasterSeed(seed);
        let privateKey = hdWallet._privateKey;
        console.log(privateKey.toString('hex'));

        console.log(cipher.privateToPublic(privateKey).toString('hex'));
        console.log(cipher.privateToAddress(privateKey).toString('hex'));

        done()
    });

    it('pub', done => {
        // publicKey 0x0433aafc025dc7b2143bc4cee26644252e8076877147df7f78d1bf184f832a87bb5eaf2afafc7673118d01ff82536767efd7123fac4fcbce66e4a0a10386a54111
        const publicKey = cipher.privateToPublic(testEnv._test_wallet.privateKey);
        console.log(publicKey.toString('hex'));

        const nodeId = publicKey.slice(1).toString('hex');
        console.log(nodeId);
        done()
    });

    it('pub-sign-verify', done => {
        let privateKey = testEnv._test_wallet.privateKey;
        let publicKey = cipher.privateToPublic(privateKey).toString('hex');

        let hash = web3.cipher.hash256("123456");
        let signature = web3.cipher.sign(new Buffer.from(hash, 'hex'), privateKey);
        const res = web3.cipher.verify(hash, signature, publicKey) // all params are hex string
        console.log(res);
        done()
    });

    it('address', done => {
        var address = cipher.privateToAddress(testEnv._test_wallet.privateKey);
        console.log(address.toString('hex'));

        const publicKey = cipher.privateToPublic(testEnv._test_wallet.privateKey);
        address = cipher.publicToAddress(publicKey.slice(1));
        console.log(address.toString('hex'));
        done()
    });
});
