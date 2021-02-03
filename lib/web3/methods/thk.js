/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";
var Method = require('../method');
var web3Util = require('../../utils/utils');
var cipher = require('../../utils/cipher');
var Property = require('../property');
var formatters = require('../formatters');
var Contract = require('../contract');
var watches = require('./watches');
var Filter = require('../filter');
var IsSyncing = require('../syncing');
var namereg = require('../namereg');

function Thk(web3) {
    this._requestManager = web3._requestManager;
    this._curCaller = null;
    this._value = null;
    this.defaultPrivateKey = null;
    this.defaultChainId = '2';
    this.defaultAddress = null;
    var self = this;

    methods().forEach(function (method) {
        method.attachToObject(self);
        method.setRequestManager(self._requestManager);
    });

    properties().forEach(function (p) {
        p.attachToObject(self);
        p.setRequestManager(self._requestManager);
    });
}

var methods = function () {
    var GetAccount = new Method({
        name: 'GetAccount',
        call: 'GetAccount',
        params: 2,
        inputFormatter: [null, formatters.inputAddressFormatter],
        buildJsonParams: function (chainId, address) {
            return ({"address": address, "chainId": chainId});
        },
        outputFormatter: formatters.outputBalanceFormatter
    });

    var SendTx = new Method({
        name: 'SendTx',
        call: 'SendTx',
        params: 1,
        inputFormatter: [function (tx) {
            tx.from = formatters.inputAddressFormatter(tx.from);
            return tx
        }],
        buildJsonParams: function (tx) {
            return tx;
        },
        outputFormatter: [null]
    });

    var GetTransactionByHash = new Method({
        name: 'GetTransactionByHash',
        call: 'GetTransactionByHash',
        params: 2,
        buildJsonParams: function (chainId, hash) {
            return ({"chainId": chainId, "hash": hash})
        },
        outputFormatter: [null]
    });

    var GetStats = new Method({
        name: 'GetStats',
        call: 'GetStats',
        params: 1,
        buildJsonParams: function (chainid) {
            return ({"chainId": chainid})
        },
        outputFormatter: [null]
    });

    var GetTransactions = new Method({
        name: 'GetTransactions',
        call: 'GetTransactions',
        params: 4,
        buildJsonParams: function (chainId, address, startheight, endheight) {
            return ({
                "chainId": chainId,
                "address": address,
                "startHeight": startheight.toString(),
                "endHeight": endheight.toString()
            })
        },
        outputFormatter: [null]
    });

    var CallTransaction = new Method({
        name: 'CallTransaction',
        call: 'CallTransaction',
        params: 1,
        buildJsonParams: function (tx) {
            return tx
        },
        outputFormatter: [null]
    });

    var GetBlockHeader = new Method({
        name: 'GetBlockHeader',
        call: 'GetBlockHeader',
        params: 2,
        buildJsonParams: function (chainId, height) {
            return ({"chainId": chainId, "height": height})
        },
        outputFormatter: [null]
    });

    var GetBlockTxs = new Method({
        name: 'GetBlockTxs',
        call: 'GetBlockTxs',
        params: 4,
        buildJsonParams: function (chainid, height, page, size) {
            return ({"chainId": chainid, "height": height, "page": page, "size": size})
        },
        outputFormatter: [null]
    });

    var RpcMakeVccProof = new Method({
        name: 'RpcMakeVccProof',
        call: 'RpcMakeVccProof',
        params: 1,
        buildJsonParams: function (params) {
            return params
        },
        outputFormatter: [null]
    });

    var MakeCCCExistenceProof = new Method({
        name: 'MakeCCCExistenceProof',
        call: 'MakeCCCExistenceProof',
        params: 1,
        buildJsonParams: function (params) {
            return params
        },
        outputFormatter: [null]
    });

    var GetChainInfo = new Method({
        name: 'GetChainInfo',
        call: 'GetChainInfo',
        params: 1,
        buildJsonParams: function (chainIds) {
            return ({"chainIds": chainIds})
        },
        outputFormatter: [null]
    });

    var Ping = new Method({
        name: 'Ping',
        call: 'Ping',
        params: 1,
        buildJsonParams: function (address) {
            return ({"address": address})
        },
        outputFormatter: [null]
    });

    var GetCommittee = new Method({
        name: 'GetCommittee',
        call: 'GetCommittee',
        params: 1,
        buildJsonParams: function (chainId, epoch) {
            return ({"chainId": chainId, "epoch": epoch})
        },
        outputFormatter: [null]
    });

    return [
        GetAccount,
        SendTx,
        GetTransactionByHash,
        GetStats,
        GetTransactions,
        CallTransaction,
        GetBlockHeader,
        GetBlockTxs,
        RpcMakeVccProof,
        MakeCCCExistenceProof,
        GetChainInfo,
        Ping,
        GetCommittee
    ];
};

var properties = function () {
    return [
        new Property({
            name: 'listAccounts',
            getter: 'personal_listAccounts'
        })
    ];
};

Thk.prototype.contract = function (abi) {
    return new Contract(this, abi);
};

Thk.prototype.setVal = function (val) {
    this._value = val
};

Thk.prototype.getVal = function () {
    return this._value
};

Thk.prototype.filter = function (options, callback, filterCreationErrorCallback) {
    return new Filter(options, 'thk', this._requestManager, watches.thk(), formatters.outputLogFormatter, callback, filterCreationErrorCallback);
};

Thk.prototype.namereg = function () {
    return this.contract(namereg.global.abi).at(namereg.global.address);
};

Thk.prototype.icapNamereg = function () {
    return this.contract(namereg.icap.abi).at(namereg.icap.address);
};

Thk.prototype.isSyncing = function (callback) {
    return new IsSyncing(this._requestManager, callback);
};

Thk.prototype.signTransaction = function (transactionDict, privateKey) {
    let to = '', from = '';
    if (transactionDict["to"].length > 2 && web3Util.isAddress(transactionDict["to"])) {
        to = transactionDict["to"].substring(2)
    }
    if (web3Util.isAddress(transactionDict["from"])) {
        from = transactionDict["from"].substring(2)
    } else {
        throw new Error('invalid address');
    }

    let input = '';
    if (transactionDict["input"] !== "") {
        input = transactionDict["input"].substring(0, 2) === '0x' ? transactionDict["input"].substring(2) : transactionDict["input"]
    }

    let useLocal_str = "0";
    if (transactionDict["useLocal"]) {
        useLocal_str = "1"
    } else {
        transactionDict["useLocal"] = false
    }

    if (this._value != null) {
        transactionDict["value"] = this._value;
    }
    let signStr = transactionDict["chainId"] + "-" + from + "-" +
        to + "-" + transactionDict["nonce"] + "-" +
        useLocal_str + "-" + transactionDict["value"] + "-" + input;
    if (!transactionDict["extra"]) {
        transactionDict["extra"] = ''
    }
    signStr = signStr + '-' + transactionDict["extra"];

    let hash = cipher.hash256(signStr);
    let signBytes = new Buffer.from(hash, 'hex');
    transactionDict['sig'] = cipher.sign(signBytes, privateKey);
    transactionDict['pub'] = '0x' + cipher.privateToPublic(privateKey).toString('hex');
    return transactionDict
};

Thk.prototype.nodeSign = function (transactionDict, privateKey) {
    let bindAddr = '';
    if (transactionDict["bindAddr"].length > 2 && web3Util.isAddress(transactionDict["bindAddr"])) {
        bindAddr = transactionDict["bindAddr"].substring(2)
    } else {
        bindAddr = ""
    }

    let signStr = transactionDict["nodeId"].toString('hex')
        + ',' + transactionDict["nodeType"]
        + ',' + bindAddr
        + ',' + transactionDict["nonce"]
        + ',' + transactionDict["amount"];

    let hash = cipher.hash256(signStr);
    let signBytes = new Buffer.from(hash, 'hex');
    return cipher.nodeSign(signBytes, privateKey);
};

module.exports = Thk;
