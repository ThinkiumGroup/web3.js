var chai = require('chai');
var assert = chai.assert;

const Web3 = require('../../index');
const web3 = new Web3();


var tests = [
    {
        obj: function () {
        }, is: false
    },
    {obj: new Function(), is: false},
    {obj: 'function', is: false},
    {obj: {}, is: false},
    {obj: '[]', is: false},
    {obj: '[1, 2]', is: false},
    {obj: '{}', is: false},
    {obj: '{"a": 123, "b" :3,}', is: false},
    {obj: '{"c" : 2}', is: false},
    {obj: 'TH80D3481O4H2MK5V63H0O1ET02HKCI27OB', is: true},
    {obj: 'T80D3481O4H2MK5V63H0O1ET02HKCI27OB', is: false},
    {obj: 'TH80D3481O4H2MK5V63H0O1ET02HKCI27OB2', is: false},
    {obj: '0x700833e77bb397f0177cc58dffc54685fa90155b', is: false},
];

describe('lib/web3/iban', function () {
    describe('isValid', function () {
        tests.forEach(function (test) {
            it('shoud test if value ' + test.obj + ' is iban: ' + test.is, function () {
                assert.equal(web3.Iban.isValid(test.obj), test.is);
            });
        });
    });
});

