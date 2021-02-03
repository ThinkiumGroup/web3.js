const chai = require('chai');
const assert = chai.assert;

const encodeCheque = require('../../lib/utils/cash-cheque').encode;
const decodeCheque = require('../../lib/utils/cash-cheque').decode;

describe('encode-decode', function () {
    it('encode', function (done) {

        done();
    });
    it('decode', function (done) {
        let input = '0x00000067f167a1c5c5fab6bddca66118216817af3fa86827000000000000003600000001f167a1c5c5fab6bddca66118216817af3fa8682700000000009d3b372000000000000000000000000000000000000004ee2d6d415b85acef8100000000';
        const cheque = decodeCheque(input);
        console.log(cheque);
        done();
    });
});
