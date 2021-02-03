var chai = require('chai');
var assert = chai.assert;
var Web3 = require('../../index');
var web3 = new Web3();
var FakeHttpProvider = require('../helpers/FakeHttpProvider');

var method = 'protocolVersion';

var tests = [{
    result: ['1234'],
    call: 'eth_'+ method
}];

describe('eth.protocolVersion', function () {
    describe(method, function () {
        tests.forEach(function (test, index) {
            it('property test: ' + index, function () {

                // given
                var provider = new FakeHttpProvider();
                web3.setProvider(provider);
                provider.injectResult(test.result);
                provider.injectValidation(function (payload) {
                    assert.equal(payload.jsonrpc, '2.0');
                    assert.equal(payload.method, test.call);
                    assert.deepEqual(payload.params, []);
                });

                // when
                var result = web3.eth[method];

                // then
                assert.deepEqual(test.result, result);
            });
        });
    });
});
