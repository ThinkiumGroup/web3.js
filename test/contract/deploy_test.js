#!/usr/bin/env node
const solc = require('solc');

const sleep = require('../common/my_util').sleep;
const testEnv = require('../common/env-test');
const web3 = testEnv.web3;

web3.thk.defaultPrivateKey = testEnv._test_wallet.privateKey;
web3.thk.defaultAddress = testEnv._test_wallet.address;
web3.thk.defaultChainId = "1";

describe('contract-test', function () {
    this.timeout(100000);
    it('contract-test', done => {
        let contents = `pragma solidity >= 0.5.0;
                        contract HelloWorld {
                            uint256 age = 17;
                            string nickname = "Hello";
                            function getAge() public view returns (uint256 data){
                                return age;
                            }
                            function getNickname() public view returns (string memory data){
                                return nickname;
                            }
                            function setNickname(string memory data) public {
                                nickname = data;
                            }
                        }`;
        const deployResult = compileContract(contents)['HelloWorld'];
        // console.log("deployResult: " + JSON.stringify(deployResult, null, 1));

        const contractAbi = deployResult.abi;
        const contractByteCode = deployResult.evm.bytecode.object.slice(0, 2) === '0x' ? deployResult.evm.bytecode.object : '0x' + deployResult.evm.bytecode.object;

        const contractAddress = deployContract(contractAbi, contractByteCode);
        console.log('contractAddress: ', contractAddress);

        callHelloContract(contractAbi, contractAddress)
        done();
    });

    it('contract-test-call', done => {
        const contractAbi = [
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "data",
                        "type": "string"
                    }
                ],
                "name": "setNickname",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getAge",
                "outputs": [
                    {
                        "name": "data",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getNickname",
                "outputs": [
                    {
                        "name": "data",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            }
        ];
        const contractAddress = "0x728c227c1d743ec82fa41fcee43ced20f38a94f6";
        callHelloContract(contractAbi, contractAddress)
        done();
    });
});

function callHelloContract(contractAbi, contractAddress) {
    const helloWorld = web3.thk.contract(contractAbi).at(contractAddress, null);

    const hash = helloWorld.setNickname("world");
    console.log("setNickname.hash:", hash);

    sleep(5);
    console.log("contract function res:", helloWorld.getNickname());
}

function compileContract(contractContent) {
    const input = {
        language: 'Solidity',
        sources: {
            'test.sol': {
                content: contractContent
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    // for (var contractName in output.contracts['test.sol']) {
    //     console.log(contractName + ': ' + output.contracts['test.sol'][contractName]);
    // }
    return output.contracts['test.sol']
}

function deployContract(abi, codes) {
    let contracts = web3.thk.contract(abi).new({data: codes});
    console.log("contracts: " + JSON.stringify(contracts, null, 1));
    if (contracts.transactionHash) {
        sleep(5);
        const res = web3.thk.GetTransactionByHash(web3.thk.defaultChainId, contracts.transactionHash);
        return res.contractAddress
    }
    return '';
}
