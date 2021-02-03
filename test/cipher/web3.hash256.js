var chai = require('chai');
var assert = chai.assert;
const cipher = require('../../lib/utils/cipher');
const ethUtils = require('ethereumjs-util');

const Web3 = require('../../index');
const web3 = new Web3();

describe('web3.hash256', function () {
    const test = function (value, hashExpected, option) {
        const hash = web3.hash256(value, option);
        console.log("value:", value, "option:", option, "\nhashExpected:", hashExpected, "\nhash:", hash, '\n');
        assert.deepEqual(hash, hashExpected);
    };

    console.log(ethUtils.keccak256(Buffer.from('80')).toString('hex'));
    console.log(cipher.hash256Buffer(Buffer.from('80')).toString('hex'));
    console.log();

    console.log(ethUtils.keccak256(Buffer.from('80', 'hex')).toString('hex'));
    console.log(cipher.hash256Buffer(Buffer.from('80', 'hex')).toString('hex'));
    console.log();

    console.log(ethUtils.sha256(Buffer.from('80')).toString('hex'));
    console.log(ethUtils.sha256(Buffer.from('80', 'hex')).toString('hex'));
    console.log();

    const hash = ethUtils.keccak256(Buffer.from('80'));
    console.log(hash);
    const hashHex = hash.toString('hex');
    console.log(hashHex);
    console.log(Buffer.from(hashHex));
    console.log(Buffer.from(hashHex, 'hex'));

    console.log();
    console.log(web3.hash256('80'));
    console.log();

    test('test123', "0x" + 'f81b517a242b218999ec8eec0ea6e2ddbef2a367a14e93f4a32a39e260f686ad');
    test('test(int)', "0x" + 'f4d03772bec1e62fbe8c5691e1a9101e520e8f8b5ca612123694632bf3cb51b1');
    test('0x80', "0x" + '6b03a5eef7706e3fb52a61c19ab1122fad7237726601ac665bd4def888f0e4a0');
    test('0x80', "0x" + '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421', {encoding: 'hex'});
    test(Buffer.from('80', 'hex'), "0x" + '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421');
    test('0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1', "0x" + '82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28', {encoding: 'hex'});
});

