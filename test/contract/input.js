#!/usr/bin/env node
const Web3 = require('../../index.js');
const web3 = new Web3();

describe('input-encode', function () {
    it('input-encode', done => {
        let address = "0xd136819a7f9d7c15c943e4f560f1a9983a09d300";
        let encoded = web3.ABI.simpleEncode("agentPledge(address):(uint256)", address);
        console.log("0x" + encoded.toString('hex'));
        console.log("0x0551f4bb000000000000000000000000d136819a7f9d7c15c943e4f560f1a9983a09d300");
        done();
    });
});
