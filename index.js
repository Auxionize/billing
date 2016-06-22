/**
 * Created by yordan on 6/7/16.
 */
'use strict';

module.exports = function(sequelize) {
	let CompanySubscription = require('./lib/models/CompanySubscription')(sequelize);
	let CompanySubscriptionTransaction = require('./lib/models/CompanySubscriptionTransaction')(sequelize);
	let Invoice = require('./lib/models/Invoice')(sequelize);
	let Transaction = require('./lib/models/Transaction')(sequelize);
	let Wallet = require('./lib/models/Wallet')(sequelize);

	return {
		CompanySubscription,
		CompanySubscriptionTransaction,
		Invoice,
		Transaction
	};

};

