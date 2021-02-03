#!/usr/bin/env node
const chai = require('chai');
const assert = chai.assert;

const BigNumber = require('bignumber.js');
const sleep = require('../common/my_util').sleep;
const testEnv = require('../common/env-test');
const web3 = testEnv.web3;

web3.thk.defaultPrivateKey = testEnv._test_wallet.privateKey;
web3.thk.defaultAddress = testEnv._test_wallet.address;
web3.thk.defaultChainId = "1";
_toChainId = "2";
_toAddress = testEnv._test_wallet.address;

let expireAfter = 200;
/*
Cross chain transfer process - withdraw money to generate a check, and then use the check to cross chain deposit
① Generate check
0. Specify check details and generate check input Web3 CashCheque.encode (cashCheque)
1. Withdrawal parameter signature Web3 thk.signTransaction ；
2. Withdrawal transaction Web3 thk.SendTx ；
3. Query withdrawal hash result Web3 thk.GetTransactionByHash ;
4. Generate check proof input Web3 thk.RpcMakeVccProof ；
② Cash a check
5. Deposit parameter signature Web3 thk.signTransaction ；
6. Deposit transaction Web3 thk.SendTx ；
7. Query deposit hash result Web3 thk.GetTransactionByHash ;
③ Cancel the check. If the deposit fails, execute the refund process
8. Cancel the check certificate thk.MakeCCCExistenceProof ；
9. Refund parameter signature Web3 thk.signTransaction ；
10. Refund transaction Web3 thk.SendTx ；
11. Query refund hash result Web3 thk.GetTransactionByHash ;
*/
describe('cash cheque', function () {
    this.timeout(100000);
    it('test cash cheque', function (done) {
        expireAfter = 200;
        let value = new BigNumber(`1`).multipliedBy('1e+18');

        let fromAccountAtFromChain = web3.thk.GetAccount(web3.thk.defaultChainId, web3.thk.defaultAddress);
        console.log("fromAccountAtFromChain :", fromAccountAtFromChain);
        const toChainInfo = web3.thk.GetStats(_toChainId);
        console.log('toChainInfo :', toChainInfo);
        let cashCheque = {
            FromChain: web3.thk.defaultChainId,
            FromAddress: web3.thk.defaultAddress,
            Nonce: fromAccountAtFromChain.nonce,
            ToChain: _toChainId,
            ToAddress: _toAddress.toLowerCase(),
            ExpireHeight: toChainInfo.currentheight + expireAfter,
            Amount: value.toString(16)
        };

        const _value_in_cheque_str = value.toString(10);
        const _nonce_in_cheque_str = cashCheque.Nonce.toString();
        const _expire_height_in_cheque_str = cashCheque.ExpireHeight.toString();

        let cashChequeAsInput = web3.CashCheque.encode(cashCheque);

        let tx = {
            chainId: cashCheque.FromChain,
            fromChainId: cashCheque.FromChain,
            toChainId: cashCheque.FromChain,
            from: cashCheque.FromAddress,
            to: web3.CashCheque.SystemContractAddressWithdraw,
            nonce: _nonce_in_cheque_str,
            value: '0',
            input: cashChequeAsInput
        };
        let signedTx = web3.thk.signTransaction(tx, web3.thk.defaultPrivateKey);
        console.log("signedTx:", signedTx);

        let txRes = web3.thk.SendTx(signedTx);
        console.log("sendTx response:", txRes);

        if (!txRes && !txRes.TXhash) {
            assert.fail("stage 1, sendTx fail");
        } else {
            sleep(7);
            let txInfo = web3.thk.GetTransactionByHash(web3.thk.defaultChainId, txRes.TXhash);
            console.log("stage 1, txInfo:", txInfo);
            if (!txInfo || txInfo.status !== 1) {
                assert.fail("stage 1, sendTx fail");
            } else {
                let proofParam = {
                    chainId: cashCheque.FromChain,
                    from: cashCheque.FromAddress,
                    to: cashCheque.ToAddress,
                    fromChainId: cashCheque.FromChain,
                    toChainId: cashCheque.ToChain,
                    value: _value_in_cheque_str,
                    expireheight: _expire_height_in_cheque_str,
                    nonce: _nonce_in_cheque_str
                };
                sleep(5);
                let proofResult = web3.thk.RpcMakeVccProof(proofParam);
                console.log('get rpcVccProof proofResult: ', proofResult);
                if (!proofResult || proofResult.errMsg) {
                    assert.fail("gen cheque proof fail");
                } else {
                    let fromAccountAtToChain = web3.thk.GetAccount(_toChainId, web3.thk.defaultAddress);
                    let tx = {
                        chainId: cashCheque.ToChain,
                        fromChainId: cashCheque.ToChain,
                        toChainId: cashCheque.ToChain,
                        from: cashCheque.FromAddress,
                        to: web3.CashCheque.SystemContractAddressDeposit,
                        nonce: fromAccountAtToChain.nonce.toString(),
                        value: '0',
                        input: proofResult.input
                    };
                    signedTx = web3.thk.signTransaction(tx, web3.thk.defaultPrivateKey);
                    console.log("sendTx signedTx:", signedTx);
                    txRes = web3.thk.SendTx(signedTx);
                    console.log("sendTx response:", txRes);
                    if (txRes && txRes.TXhash) {
                        sleep(5);
                        txInfo = web3.thk.GetTransactionByHash(_toChainId, txRes.TXhash);
                        console.log("stage 2, txInfo:", txInfo);
                        if (txInfo && txInfo.status === 1) {
                            console.log('sendTx success!!!');
                        } else {
                            let cancelProofParam = {
                                chainId: cashCheque.ToChain,
                                from: cashCheque.FromAddress,
                                to: cashCheque.ToAddress,
                                fromChainId: cashCheque.FromChain,
                                toChainId: cashCheque.ToChain,
                                value: _value_in_cheque_str,
                                expireheight: _expire_height_in_cheque_str,
                                nonce: _nonce_in_cheque_str
                            };
                            let proof2Cancel = web3.thk.MakeCCCExistenceProof(cancelProofParam);
                            console.log('get proof2Cancel: ', proof2Cancel);
                            if (proof2Cancel && !proof2Cancel.errMsg) {
                                fromAccountAtFromChain = web3.thk.GetAccount(web3.thk.defaultChainId, web3.thk.defaultAddress);
                                tx = {
                                    chainId: web3.thk.defaultChainId,
                                    fromChainId: web3.thk.defaultChainId,
                                    toChainId: web3.thk.defaultChainId,
                                    from: web3.thk.defaultAddress,
                                    to: web3.CashCheque.SystemContractAddressCancel,
                                    nonce: fromAccountAtFromChain.nonce.toString(),
                                    value: '0',
                                    input: proof2Cancel.input
                                };
                                signedTx = web3.thk.signTransaction(tx, web3.thk.defaultPrivateKey);
                                console.log("sendTx signedTx:", txRes);
                                txRes = web3.thk.SendTx(signedTx);
                                console.log("sendTx response:", txRes);
                                if (!txRes || !txRes.TXhash) {
                                    assert.fail("stage 2, sendTx fail");
                                } else {
                                    sleep(5);
                                    txInfo = web3.thk.GetTransactionByHash(web3.thk.defaultChainId, txRes.TXhash);
                                    console.log("stage 3, txInfo:", txInfo);
                                    if (txInfo && txInfo.status === 1) {
                                        console.log('sendTx refund success!!!');
                                    } else {
                                        console.log('sendTx refund failed!!!');
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        done();
    });
});





