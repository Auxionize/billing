/**
 * Created by yordan on 6/7/16.
 */
'use strict';

const _ = require('lodash');
const processEnumObject = require('./lib/utils/enum').processEnumObject;
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
	let CompanySubscriptionStatus = {Pending: '', Active: '', Expired: ''};
	let InvoiceType = {Proforma: '', Invoice: '', CreditNote: ''};
	let InvoiceStatus = {Active: '', Canceled: ''};
	let TransactionType = {Proforma: '', Invoice: ''};
	let TransactionSide = {Charge: '', Payment: ''};
	let TransactionLinkType = {Auction: ''};

	processEnumObject(CompanySubscriptionStatus);
	processEnumObject(InvoiceType);
	processEnumObject(InvoiceStatus);
	processEnumObject(TransactionType);
	processEnumObject(TransactionSide);
	processEnumObject(TransactionLinkType);

	let enums = {
		CompanySubscriptionStatus,
		InvoiceType,
		InvoiceStatus,
		TransactionType,
		TransactionSide,
		TransactionLinkType
	};
	let exportObject = {subscriptionUtil, enums};

	if(!_.isUndefined(sequelize)) {
		_.forEach(models, function(modelName) {
			exportObject[modelName] = require(`${modelsPath}${modelName}`)(sequelize, enums);
		});

	}

	return exportObject;

};

