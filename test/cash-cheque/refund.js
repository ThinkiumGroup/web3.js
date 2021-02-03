#!/usr/bin/env node
const chai = require('chai');
const assert = chai.assert;

const sleep = require('../common/my_util').sleep;
const BigNumber = require('bignumber.js');
const testEnv = require('../common/env-test');
const web3 = testEnv.web3;

web3.thk.defaultPrivateKey = testEnv._test_wallet.privateKey;
web3.thk.defaultChainId = "1";
web3.thk.defaultAddress = testEnv._test_wallet.address;
_toChainId = '2';
_toAddress = testEnv._test_wallet.address;

/*Continue the transaction or refund process
Judge whether the check is overdue (beyond the specified block height) to terminate the transaction or continue the deposit transaction
Termination of transaction
1. Get proof of cancellation check Web3 thk.MakeCCCExistenceProof
2. Refund parameter signature Web3 thk.signTransaction ；
3. Refund transaction thk.SendTx ；
4. Query refund hash result Web3 thk.GetTransactionByHash ;
Continue trading
1. Get proof of deposit Web3 thk.RpcMakeVccProof ；
5. Deposit parameter signature Web3 thk.signTransaction ；
6. Deposit transaction Web3 thk.SendTx ；
7. Query deposit hash result Web3 thk.GetTransactionByHash ;
*/
describe('refund', function () {
    this.timeout(100000);
    it('cancel1', done => {
        const chequeInput = "0x00000067f167a1c5c5fab6bddca66118216817af3fa86827000000000000002900000001f167a1c5c5fab6bddca66118216817af3fa8682700000000008c3d24200000000000000000000000000000000000000000000000000de0b6b3a7640000";
        toRefund(chequeInput);
        done()
    });

    it('cancel2', done => {
        let value = new BigNumber(`0.1`).multipliedBy('1e+18');

        const fromAccountAtFromChain = web3.thk.GetAccount(web3.thk.defaultChainId, web3.thk.defaultAddress);
        console.log("fromAccountAtFromChain :", fromAccountAtFromChain);
        const toChainInfo = web3.thk.GetStats(_toChainId);
        console.log('toChainInfo :', toChainInfo);
        let cashCheque = {
            FromChain: web3.thk.defaultChainId,
            FromAddress: web3.thk.defaultAddress,
            Nonce: fromAccountAtFromChain.nonce,
            ToChain: _toChainId,
            ToAddress: _toAddress.toLowerCase(),
            ExpireHeight: toChainInfo.currentheight + 200,
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
                console.log('cancelProofParam: ', cancelProofParam);
                // toRefund
                const chequeInput = txInfo.tx.input;
                toRefund(chequeInput);
            }
        }
        done()
    });
});

function toRefund(chequeInput) {
    console.log("chequeInput:", chequeInput);
    const cheque = web3.CashCheque.decode(chequeInput);
    let cancelProofParam2 = {
        chainId: cheque.ToChain,
        from: cheque.FromAddress,
        to: cheque.ToAddress,
        fromChainId: cheque.FromChain,
        toChainId: cheque.ToChain,
        value: cheque.Amount.toString(),
        expireheight: cheque.ExpireHeight.toString(),
        nonce: cheque.Nonce.toString()
    };
    console.log('cancelProofParam2: ', cancelProofParam2);
    let proof2Cancel = web3.thk.MakeCCCExistenceProof(cancelProofParam2);
    console.log('get proof2Cancel: ', proof2Cancel);
    if (proof2Cancel && !proof2Cancel.errMsg) {
        let fromAccountAtFromChain = web3.thk.GetAccount(cheque.FromChain, cheque.FromAddress);
        const tx = {
            chainId: cheque.FromChain,
            fromChainId: cheque.FromChain,
            toChainId: cheque.FromChain,
            from: cheque.FromAddress,
            to: web3.CashCheque.SystemContractAddressCancel,
            nonce: fromAccountAtFromChain.nonce.toString(),
            value: '0',
            input: proof2Cancel.input
        };
        const signedTx = web3.thk.signTransaction(tx, web3.thk.defaultPrivateKey);
        console.log("sendTx signedTx:", signedTx);
        const txRes = web3.thk.SendTx(signedTx);
        console.log("sendTx response:", txRes);
        if (!txRes || !txRes.TXhash) {
            assert.fail("stage 2, sendTx fail");
        } else {
            sleep(5);
            const txInfo = web3.thk.GetTransactionByHash(cheque.FromChain, txRes.TXhash);
            console.log("stage 2, txInfo:", txInfo);
            if (txInfo && txInfo.status === 1) {
                console.log('sendTx toRefund success!!!');
            } else {
                console.log('sendTx toRefund failed!!!');
            }
        }
    }
}
