var chai = require('chai');
var testMethod = require('../helpers/test.method.js');

var method = 'getString';

var tests = [{
    args: ['myDB', 'myKey'],
    formattedArgs: ['myDB', 'myKey'],
    result: 'myValue',
    formattedResult: 'myValue',
    call: 'db_'+ method
}];

testMethod.runTests('db', method, tests);

