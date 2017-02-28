/**
 * Created by yordan on 6/7/16.
 */
'use strict';

const _ = require('lodash');

const billingEnums = require('./lib/utils/billingEnums');

const models = [
	'CompanySubscription',
	'CompanySubscriptionTransaction',
	'Invoice',
	'Transaction',
	'Wallet'
];

const modelsPath = './lib/models/';
let subscriptionUtil = require('./lib/utils/subscriptionUtil');

let billingModule = function(sequelize, config) {


	_.extend(billingEnums, subscriptionUtil.SubscriptionTypeIdent);

	let exportObject = {subscriptionUtil, billingEnums};

	if(!_.isUndefined(sequelize)) {
		_.forEach(models, function(modelName) {
			exportObject[modelName] = require(`${modelsPath}${modelName}`)(sequelize, billingEnums, config);
		});

	}

	return exportObject;

};

billingModule.enums = billingEnums;
billingModule.subscriptionUtil = subscriptionUtil;
module.exports = billingModule;