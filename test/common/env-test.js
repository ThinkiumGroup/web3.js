const rpc_host = 'http://rpctest.thinkium.org';

const Web3 = require('../../index.js');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(rpc_host));

const _test_wallet = {
    privateKey: new Buffer('5e4f498ecefc650b8226cee874eb31cdc5ffd0c629240c2c8ff036c0f57a1474', 'hex'),
    address: "0x3438b5f0abbcc929d01ecc83e3507d4adb134674",
    privateKey2: new Buffer('c614545a9f1d9a2eeda26836e42a4c11631f25dc3d0dcc37fe62a89c4ff293d1', 'hex'),
    address2: "0x5dfcfc6f4b48f93213dad643a50228ff873c15b9",
};

module.exports = {
    rpc_host,
    web3,
    _test_wallet
};
