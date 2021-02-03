var chai = require('chai');
var assert = chai.assert;
var Web3 = require('../../index');
var web3 = new Web3();
var FakeHttpProvider = require('../helpers/FakeHttpProvider');

// use sendTransaction as dummy
var method = 'sendTransaction';

var tests = [{
    input: {
        'from': 'TH77SDR4G0NS4EVQP1G2A50HNEB5PHI8A0Y',
        'to': 'TH56EUQ9E8IHVF442Z1V4S7JZ0T6GTBVF44'
    },
    formattedInput: {
        'from': '0xf2f94513807d5ec3679eb17cd5462bec8b8aeac2',
        'to': '0x7f28b80861779ef731bc1f56a4a7a36c3c285d44'
    },
    result: '0xb',
    formattedResult: '0xb',
    call: 'eth_' + method
}];

describe('async', function () {
    tests.forEach(function (test, index) {
        it('test: ' + index, function (done) {
            // given
            var provider = new FakeHttpProvider();
            web3.setProvider(provider);
            provider.injectResult(test.result);
            provider.injectValidation(function (payload) {
                console.log(payload);
                // assert.equal(payload.jsonrpc, '2.0');
                assert.equal(payload.method, test.call);
                assert.deepEqual(payload.params, [test.formattedInput]);
            });
            // when
            web3.eth[method](test.input, function (error, result) {
                // then
                assert.isNull(error);
                assert.strictEqual(test.formattedResult, result);
                done();
            });
        });

        it('error test: ' + index, function (done) {
            // given
            var provider = new FakeHttpProvider();
            web3.setProvider(provider);
            provider.injectError({
                message: test.result,
                code: -32603
            });
            provider.injectValidation(function (payload) {
                // assert.equal(payload.jsonrpc, '2.0');
                assert.equal(payload.method, test.call);
                assert.deepEqual(payload.params, [test.formattedInput]);
            });

            // when
            web3.eth[method](test.input, function (error, result) {
                // then
                assert.isUndefined(result);
                assert.strictEqual(test.formattedResult, error.message);

                done();
            });
        });
    });
});

