var chai = require('chai');
var Web3 = require('../../index');
var web3 = new Web3();
var testMethod = require('../helpers/test.method.js');

var method = 'getCode';
var assert = chai.assert;

var FakeHttpProvider = require('../helpers/FakeHttpProvider');
var clone = function (object) {
    return JSON.parse(JSON.stringify(object));
};


var tests = [{
    args: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855'],
    formattedArgs: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', web3.eth.defaultBlock],
    result: '0x47d33b27bb249a2dbab4c0612bf9caf4747d33b27bb249a2dbab4c0612bf9cafd33b27bb249a2dbab4c0612bf9caf4c1950855',
    formattedResult: '0x47d33b27bb249a2dbab4c0612bf9caf4747d33b27bb249a2dbab4c0612bf9cafd33b27bb249a2dbab4c0612bf9caf4c1950855',
    call: 'eth_' + method
}, {
    args: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', 2],
    formattedArgs: ['0x47d33b27bb249a2dbab4c0612bf9caf4c1950855', '0x2'],
    result: '0x47d33b27bb249a2dbab4c0612bf9caf4747d33b27bb249a2dbab4c0612bf9cafd33b27bb249a2dbab4c0612bf9caf4c1950855',
    formattedResult: '0x47d33b27bb249a2dbab4c0612bf9caf4747d33b27bb249a2dbab4c0612bf9cafd33b27bb249a2dbab4c0612bf9caf4c1950855',
    call: 'eth_' + method
}];

// testMethod.runTests(, method, tests);
obj = 'eth'

describe(method, function () {
    describe(method, function () {
        tests.forEach(function (test, index) {
            it('sync test: ' + index, function () {
                // given
                var provider = new FakeHttpProvider();
                var web3 = new Web3(provider);
                provider.injectResult(test.result);
                provider.injectValidation(function (payload) {
                    // assert.equal(payload.jsonrpc, '2.0');
                    assert.equal(payload.method, test.call);
                    assert.deepEqual(payload.params, test.formattedArgs);
                });

                var args = clone(test.args)

                // when
                if (obj) {
                    var result = web3[obj][method].apply(web3[obj], args);
                } else {
                    var result = web3[method].apply(web3, args);
                }
                // when
                //var result = (obj)
                //? web3[obj][method].apply(null, test.args.slice(0))
                //: web3[method].apply(null, test.args.slice(0));

                // then
                assert.deepEqual(test.formattedResult, result);
            });

            it('async test: ' + index, function (done) {
                // given
                var provider = new FakeHttpProvider();
                var web3 = new Web3(provider);

                provider.injectResult(test.result);
                provider.injectValidation(function (payload) {
                    assert.equal(payload.jsonrpc, '2.0');
                    assert.equal(payload.method, test.call);
                    assert.deepEqual(payload.params, test.formattedArgs);
                });

                var args = clone(test.args);
                // add callback
                args.push(function (err, result) {
                    assert.deepEqual(test.formattedResult, result);
                    done();
                });

                // when
                if (obj) {
                    web3[obj][method].apply(web3[obj], args);
                } else {
                    web3[method].apply(web3, args);
                }
            });
        });
    });
});
