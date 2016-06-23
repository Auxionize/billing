/**
 * Created by yordan on 6/7/16.
 */
'use strict';

const _ = require('lodash');
const models = [
	'CompanySubscription',
	'CompanySubscriptionTransaction',
	'Invoice',
	'Transaction',
	'Wallet'
];
const modelsPath = './lib/models/';

module.exports = function(sequelize) {
	let subscriptionUtil = require('./lib/utils/subscriptionUtil');
	let exportObject = {subscriptionUtil};

	if(!_.isUndefined(sequelize)) {
		_.forEach(models, function(modelName) {
			exportObject[modelName] = require(`${modelsPath}${modelName}`)(sequelize);
		});

	}

	return exportObject;

};

