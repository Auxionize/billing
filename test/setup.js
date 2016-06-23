/**
 * Created by yordan on 6/24/16.
 */
'use strict';

const dbConfig = {
	"username": "postgres",
	"database": "test-billing",
	"host": "localhost",
	'port': 5432,
	"dialect": "postgres",
	"logging": console.log
};

//chai assertion library
const chai = require('chai');

//return promises instead of calling next() in tests, setup and teardown methods
chai.use(require('chai-as-promised'));

//includes expect(something).to.have.properties(someDeepProperties);
chai.use(require('chai-properties'));

//this one allows using generator functions in tests, setup and teardown methods. See co library
require('co-mocha');

module.exports = {
	expect: chai.expect,
	dbConfig: dbConfig
};