/**
 * Created by yordan on 6/24/16.
 */
'use strict';

const expect = require('./setup').expect;
const config = require('./setup').dbConfig;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.username, config.password, config);
let billingModule = require('../index')(sequelize);

describe('BillingModule', function () {

	beforeEach(function*() {
		// TODO create and seed all tables needed for the world creation
	});

	it('should mean something', function*() {
		let smart = true;

		expect(smart).to.be.true;
	});
});
