#!/usr/bin/env node
const testEnv = require('../common/env-test');
const cipher = require('../../lib/utils/cipher');
const bip39 = require('bip39');
const hdkey = require('hdkey');

describe('test-cipher', function () {
    this.timeout(100000);
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
    it('address', done => {
        var address = cipher.privateToAddress(testEnv._test_wallet.privateKey);
        console.log(address.toString('hex'));

        const publicKey = cipher.privateToPublic(testEnv._test_wallet.privateKey);
        address = cipher.publicToAddress(publicKey.slice(1));
        console.log(address.toString('hex'));
        done()
    });
});
