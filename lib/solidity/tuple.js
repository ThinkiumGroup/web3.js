var f = require('./formatters');
var SolidityType = require('./type');

var SolidityTypeTuple = function () {
    this._inputFormatter = f.formatInputString;
    this._outputFormatter = f.formatOutputString;
};

SolidityTypeTuple.prototype = new SolidityType({});
SolidityTypeTuple.prototype.constructor = SolidityTypeTuple;

SolidityTypeTuple.prototype.isType = function (name) {
    return !!name.match(/^tuple(\[([0-9]*)\])*$/);
};

SolidityTypeTuple.prototype.isDynamicType = function () {

    return false;
};

module.exports = SolidityTypeTuple;
