#!/usr/bin/env node
const cipher = require('../lib/utils/cipher');

const testEnv = require('../test/common/env-test');
const web3 = testEnv.web3;

web3.thk.defaultPrivateKey = testEnv._test_wallet.privateKey;
web3.thk.defaultAddress = testEnv._test_wallet.address;
web3.thk.defaultChainId = "1";

/**
 * get account info
 */
function getAccount(chainId, address) {
    return web3.thk.GetAccount(chainId, address)
}

/**
 * send transaction
 */
function sendTx(chainId, fromAddress, toAddress, value, nonce, privateKey, inputs) {
    let obj = {
        chainId: chainId,
        fromChainId: chainId,
        toChainId: chainId,
        from: fromAddress,
        to: toAddress,
        nonce: nonce,
        value: value.toString(),
        input: inputs,
        useLocal: false,
        extra: ''
    };
    let sendTxParams = web3.thk.signTransaction(obj, privateKey);
    return web3.thk.SendTx(sendTxParams)
}


/**
 * get transaction info by hash
 */
function getTxHashRes(chainId, txHash) {
    return web3.thk.GetTransactionByHash(chainId, txHash)
}

function getStateInfo(chainId) {
    return web3.thk.GetStats(chainId)
}


/**
 * Obtain the transaction information of the specified account within a certain height range on the corresponding chain
 */
function getTransactionInfos(chainId, address, startHeight, endHeight) {
    return web3.thk.GetTransactions(chainId, address, startHeight, endHeight)
}


/**
 * call contract
 */
function getTransferInfo(chainId, fromChainId, toChainId, fromAddress, toAddress, value, nonce, inputs) {
    let obj = {
        chainId: chainId,
        from: fromAddress,
        to: toAddress,
        fromChainId: fromChainId,
        toChainId: toChainId,
        nonce: nonce,
        value: value.toString(),
        input: inputs
    };
    return web3.thk.CallTransaction(obj)
}


/**
 * get block info at the given height
 */
function getBlockHeightInfo(chainId, height) {
    return web3.thk.GetBlockHeader(chainId, height)
}


/**
 * get transactions
 */
function getBlockPageInfos(chainId, height, page, size) {
    return web3.thk.GetBlockTxs(chainId, height, page, size)
}

/**
 * get chain info
 */
function getChainInfos(chainIds) {
    return web3.thk.GetChainInfo(chainIds)
}

/**
 * check machine health
 */
function pingUrl(url) {
    return web3.thk.Ping(url)
}

/**
 * get committees
 */
function getCommittee(chainId, epoch) {
    return web3.thk.GetCommittee(chainId, epoch)
}

function Str2Bytes(str) {
    var pos = 0;
    var len = str.length;
    if (len % 2 != 0) {
        return null;
    }
    len /= 2;
    var hexA = [];
    for (var i = 0; i < len; i++) {
        var s = str.substr(pos, 2);
        var v = parseInt(s, 16);
        hexA.push(v);
        pos += 2;
    }
    return hexA;
}

/**
 * @description: pos pledge
 * @param {string} asset   pledge amounts
 * @param {string} contract   the node contract address
 * @param {string} nodeidPrivatekey  private key of the node
 * @return:
 */
function depositSendTx(asset, contract, nodeidPrivatekey) {
    let balancess = getAccount('2', web3.thk.defaultAddress);
    let privateKeys = new Buffer.alloc(32, nodeidPrivatekey, 'hex')
    let nodeids = cipher.privateToPublic(privateKeys).slice(1);

    let obj = {
        bindAddr: contract.toLowerCase(),
        nodeType: 1,
        nonce: balancess.nonce.toString(),
        amount: asset,
        nodeId: nodeids
    };
    let nodeSig = web3.thk.nodeSign(obj, privateKeys)
    let encoded = web3.ABI.simpleEncode(
        "deposit(bytes,uint8,address,uint64,uint256,string):(bytes,uint256,uint256,uint256,uint256,string)",
        nodeids,
        1,
        contract.toLowerCase(),
        balancess.nonce.toString(),
        asset,
        nodeSig
    );
    let objs = {
        chainId: '2',
        fromChainId: '2',
        toChainId: '2',
        from: web3.thk.defaultAddress.toLowerCase(),
        to: contract.toLowerCase(),
        nonce: balancess.nonce.toString(),
        value: asset,
        input: encoded.toString('hex'),
        useLocal: false,
        extra: ''
    };

    let TxParams = web3.thk.signTransaction(objs, privateKey)
    return web3.thk.SendTx(TxParams)
}

/**
 * @description: pos withdraw
 * @param {string} asset   withdraw amount
 * @param {string} contract   node contract address
 * @param {string} nodeidPrivatekey   node private key
 * @return:
 */
function withDraw(asset, contract, nodeidPrivatekey) {
    let balancess = getAccount('2', web3.thk.defaultAddress);
    let privateKeys = new Buffer.alloc(32, nodeidPrivatekey, 'hex')
    let nodeids = cipher.privateToPublic(privateKeys).slice(1).toString('hex');
    let encoded = web3.ABI.simpleEncode("withdraw(bytes,address):(bytes,uint256)",
        nodeids,
        web3.thk.defaultAddress.toLowerCase()
    );
    let objs = {
        chainId: '2',
        fromChainId: '2',
        toChainId: '2',
        from: web3.thk.defaultAddress.toLowerCase(),
        to: contract,
        nonce: balancess.nonce.toString(),
        value: asset,
        input: encoded.toString('hex'),
        useLocal: false,
        extra: ''
    };

    let TxParams = web3.thk.signTransaction(objs, privateKey)
    return web3.thk.SendTx(TxParams)
}

/**
 * @description: pos withdraw cash
 * @param {string} asset   withdraw amount
 * @param {string} contract   pos node contract address
 * @return:
 */
function withDrawCash(asset, contract) {
    let balancess = getAccount('2', web3.thk.defaultAddress);
    let encoded = web3.ABI.simpleEncode("withdrawCash(uint256):(uint256)", asset);
    let objs = {
        chainId: '2',
        fromChainId: '2',
        toChainId: '2',
        from: web3.thk.defaultAddress.toLowerCase(),
        to: contract.toLowerCase(),
        nonce: balancess.nonce.toString(),
        value: '0',
        input: encoded.toString('hex'),
        useLocal: false,
        extra: ''
    };

    let TxParams = web3.thk.signTransaction(objs, privateKey)
    return web3.thk.SendTx(TxParams)
}

let privateKeys = new Buffer.alloc(32, '9a06fcd977f574525a866792f747702fa4f762bac39e46cf5894a8b3125564e7', 'hex')
let nodeId = cipher.privateToPublic(privateKeys).slice(1).toString('hex');
console.log(nodeId);

// let testResult = depositSendTx('200000000000000000000000','0x7180874668217daf6f64b64c17898b5547352b7f','9a646fea4be071d1710e16b0a3f3c4b74b21a2f3ea50c67d7b54b83b7c31340c');
// console.log('get send transaction result',testResult);
// let withDrawResult = withDraw('200000000000000000000000','0x7180874668217daf6f64b64c17898b5547352b7f','9a646fea4be071d1710e16b0a3f3c4b74b21a2f3ea50c67d7b54b83b7c31340c');
// console.log('get send withdraw result',withDrawResult);
// let withDrawCashResult = withDrawCash();
// console.log('get send withdraw cash result',withDrawCashResult);

// let balancess = getAccount('1', web3.thk.defaultAddress);
// console.log('get account balance response',balancess);

// let sendtxResp = sendTx('1', web3.thk.defaultAddress,'0x1900c8ee3b3a511db4f0297c8df7151ffdb71709', '10000000000000000000000', balancess.nonce.toString(), web3.thk.defaultPrivateKey,'');
// console.log("get sendtx response:",sendtxResp);

// var getTxByHashResp = getTxHashRes(web3.thk.defaultChainId, '0xba2fe9309f7e1bcd1a04cd9f50a918f88d5f5da09422fa025373543463eccc09');
// console.log("get  TxByHashResp response:",getTxByHashResp);

// var getStatsResp = getStateInfo(web3.thk.defaultChainId);
// console.log("get statsResp:",getStatsResp);

// var getTxsResp = getTransactionInfos(web3.thk.defaultChainId,'0x4fa1c4e6182b6b7f3bca273390cf587b50b47311', 50, 70);
// console.log("get TxinfosResp response:", getTxsResp);

// var callTransactionResp = getTransferInfo(web3.thk.defaultChainId, '2', '2', '0x0000000000000000000000000000000000000000', '0x0e50cea0402d2a396b0db1c5d08155bd219cc52e', '0', '22','0xe98b7f4d0000000000000000000000000000000000000000000000000000000000000001');
// console.log("callTransactionResp response:", callTransactionResp);

// var getBlockHeaderResp = getBlockHeightInfo('2', '30');
// console.log('get blockheader', getBlockHeaderResp)

// var getBlockTxsResp = getBlockPageInfos(web3.thk.defaultChainId, '30','1','10');
// console.log("getBlockTxsResp response:", getBlockTxsResp);

// var compileContractResp = getCompileContract(web3.thk.defaultChainId, 'pragma solidity >= 0.4.22;contract test {function multiply(uint a) public returns(uint d) {return a * 7;}}');
// console.log("compileContractResp response:",compileContractResp);

// var hash = web3.hash256("Some string to be hashed");
// console.log(hash);

// var getChainInfoResp = getChainInfos([]);
// console.log("get chaininfo res:",getChainInfoResp);

// var getPingResp = pingUrl("192.168.1.13:22010");
// console.log("PING res:",getPingResp);

// var getCommitteeResp = getCommittee(web3.thk.defaultChainId,'4');
// console.log("get committee res:",getCommitteeResp);


// function getContract(abi){
//     var getcommittee = web3.thk.contract(abi);
//     return getcommittee
// }

// var abis = [
//     {
//      "constant": false,
//      "inputs": [
//       {
//        "name": "data",
//        "type": "string"
//       }
//      ],
//      "name": "setString",
//      "outputs": [],
//      "payable": false,
//      "stateMutability": "nonpayable",
//      "type": "function"
//     },
//     {
//      "constant": true,
//      "inputs": [],
//      "name": "getString",
//      "outputs": [
//       {
//        "name": "data",
//        "type": "string"
//       }
//      ],
//      "payable": false,
//      "stateMutability": "view",
//      "type": "function"
//     },
//     {
//      "constant": true,
//      "inputs": [],
//      "name": "getA",
//      "outputs": [
//       {
//        "name": "data",
//        "type": "uint256"
//       }
//      ],
//      "payable": false,
//      "stateMutability": "view",
//      "type": "function"
//     }
//    ]
// var code = "0x60806040526152f16000556040805190810160405280600581526020017f48656c6c6f00000000000000000000000000000000000000000000000000000081525060019080519060200190610055929190610068565b5034801561006257600080fd5b5061010d565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106100a957805160ff19168380011785556100d7565b828001600101855582156100d7579182015b828111156100d65782518255916020019190600101906100bb565b5b5090506100e491906100e8565b5090565b61010a91905b808211156101065760008160009055506001016100ee565b5090565b90565b6103758061011c6000396000f3fe608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680637fcaf6661461005c57806389ea642f14610124578063d46300fd146101b4575b600080fd5b34801561006857600080fd5b506101226004803603602081101561007f57600080fd5b810190808035906020019064010000000081111561009c57600080fd5b8201836020820111156100ae57600080fd5b803590602001918460018302840111640100000000831117156100d057600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506101df565b005b34801561013057600080fd5b506101396101f9565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561017957808201518184015260208101905061015e565b50505050905090810190601f1680156101a65780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156101c057600080fd5b506101c961029b565b6040518082815260200191505060405180910390f35b80600190805190602001906101f59291906102a4565b5050565b606060018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102915780601f1061026657610100808354040283529160200191610291565b820191906000526020600020905b81548152906001019060200180831161027457829003601f168201915b5050505050905090565b60008054905090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106102e557805160ff1916838001178555610313565b82800160010185558215610313579182015b828111156103125782518255916020019190600101906102f7565b5b5090506103209190610324565b5090565b61034691905b8082111561034257600081600090555060010161032a565b5090565b9056fea165627a7a72305820197c09c4339884dcfb3804dad1a8ca4b400d10582e125ed5c7c114105bd91bc00029"
// var getContractResp = getContract(abis)

// getContractResp.new({data: code}, function (err, hash) {
//     if(err) {
//         console.error('error',err);
//         return;
//     } else if(hash){
//         sleep(5000)
//         var conresp = web3.thk.GetTransactionByHash(web3.thk.defaultChainId, hash)
//         var MyContract = web3.thk.contract(abis,conresp.contractAddress);
//         var contractObj = MyContract.at(conresp.contractAddress)
//         contractObj.setString("world")
//         sleep(5000)
//         contractObj.getString()
//         console.log("get contract function res:",contractObj.getString());
//     }
// });






