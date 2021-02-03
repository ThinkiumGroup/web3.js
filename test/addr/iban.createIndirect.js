var chai = require('chai');
const Web3 = require('../../index.js');
const web3 = new Web3();

var assert = chai.assert;

var tests = [
    {institution: 'XREG', identifier: 'GAVOFYORK', expected: 'TH73XREGGAVOFYORK'},
    {institution: 'D348', identifier: '1O4H2MK5V63H0O1ET02HKCI27OB', expected: 'TH80D3481O4H2MK5V63H0O1ET02HKCI27OB'},
    {institution: 'D3481O4H2MK5V63H', identifier: '0O1ET02HKCI27OB', expected: 'TH80D3481O4H2MK5V63H0O1ET02HKCI27OB'},
    {institution: 'D3481O4H2MK5V63H0O1ET02HKCI27OB', identifier: '', expected: 'TH80D3481O4H2MK5V63H0O1ET02HKCI27OB'}
];

describe('lib/web3/iban', function () {
    describe('createIndirect', function () {
        tests.forEach(function (test) {
            it('shoud create indirect iban: ' + test.expected, function () {
                assert.deepEqual(web3.Iban.createIndirect({
                    institution: test.institution,
                    identifier: test.identifier
                }), new web3.Iban(test.expected));
            });
        });
    });
});

