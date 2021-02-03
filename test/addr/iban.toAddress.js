var chai = require('chai');
var assert = chai.assert;

const Web3 = require('../../index');
const web3 = new Web3();

var tests = [
    {direct: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', address: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8'},
    {direct: 'TH80D3481O4H2MK5V63H0O1ET02HKCI27OB', address: '0x700833e77bb397f0177cc58dffc54685fa90155b'},
];

describe('lib/web3/iban', function () {
    describe('toAddress', function () {
        tests.forEach(function (test) {
            it('should transform iban to address: ' + test.address, function () {
                assert.deepEqual(web3.Iban.toAddress(test.direct).toLowerCase(), test.address);
            });
        });
    });
});

