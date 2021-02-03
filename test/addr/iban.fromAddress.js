var chai = require('chai');
const Web3 = require('../../index.js');
const web3 = new Web3();
var assert = chai.assert;

var tests = [
    {address: '0x700833e77bb397f0177cc58dffc54685fa90155b', expected: 'TH80D3481O4H2MK5V63H0O1ET02HKCI27OB'}
];

describe('lib/web3/iban', function () {
    describe('fromAddress', function () {
        tests.forEach(function (test) {
            it('shoud create indirect iban: ' + test.expected, function () {
                assert.deepEqual(web3.Iban.fromAddress(test.address), new web3.Iban(test.expected));
            });
        });
    });
});

