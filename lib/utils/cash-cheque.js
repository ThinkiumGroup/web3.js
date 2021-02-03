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
// withdraw tkm to a check
const SystemContractAddressWithdraw = "0x0000000000000000000000000000000000020000";
// deposit tkm - From check deposit to account
const SystemContractAddressDeposit = "0x0000000000000000000000000000000000030000";
// cancel a check - return from check to original account
const SystemContractAddressCancel = "0x0000000000000000000000000000000000040000";

const BigNumber = require('bignumber.js');

const leftPad = function (string, chars, hasPrefix, sign) {
    //var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
    string = string.toString(16).replace(/^0x/i, '');

    const padding = (chars - string.length + 1 >= 0) ? chars - string.length + 1 : 0;
    return (hasPrefix ? '0x' : '') + new Array(padding).join(sign ? sign : "0") + string;
};
const amountLeftPad = (string, chars, hasPrefix, sign) => {
    //var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
    // string = string.toString(16).replace(/^0x/i,'');

    const padding = (chars - string.length + 1 >= 0) ? chars - string.length + 1 : 0;
    return (hasPrefix ? '0x' : '') + new Array(padding).join(sign ? sign : "0") + string;
};

// serialize
// 4bytes FromChain + 20bytes FromAddress + 8bytes Nonce + 4bytes ToChain + 20bytes ToAddress +
// 8bytes ExpireHeight + 1bytes len(Amount.Bytes()) + Amount.Bytes()
// are all BigEndian
function encode(CashCheck) {
    let str = "0x";
    str += leftPad(Number(CashCheck.FromChain), 8);
    str += leftPad(CashCheck.FromAddress, 40);
    str += leftPad(CashCheck.Nonce, 16);
    str += leftPad(Number(CashCheck.ToChain), 8);
    str += leftPad(CashCheck.ToAddress, 40);
    str += leftPad(CashCheck.ExpireHeight, 16);
    str += leftPad(32, 2);
    str += amountLeftPad(CashCheck.Amount, 64);
    return str
}

function decode(str) {
    if (!str || str.length < 196) {
        return;
    }
    let cheque = {};
    cheque.FromChain = parseInt(str.slice(2, 10), 16).toString();
    cheque.FromAddress = '0x' + str.slice(10, 50);
    cheque.Nonce = parseInt(str.slice(50, 66), 16).toString();
    cheque.ToChain = parseInt(str.slice(66, 74), 16).toString();
    cheque.ToAddress = '0x' + str.slice(74, 114);
    cheque.ExpireHeight = parseInt(str.slice(114, 130), 16).toString();
    cheque.Amount = new BigNumber('0x' + str.slice(132, 196), 10).toString(10);
    return cheque;
}

module.exports = {
    SystemContractAddressWithdraw,
    SystemContractAddressDeposit,
    SystemContractAddressCancel,
    encode,
    decode
};
