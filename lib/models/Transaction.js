'use strict';

const _ = require('lodash'),
	prepareQuery = require('../utils/queries').prepareQuery,
	processEnumObject = require('../utils/enum').processEnumObject;

let TransactionType = {
		Proforma: '' ,
		Invoice: ''
	},
	TransactionSide = {
		Charge: '' ,
		Payment: ''
	},
	TransactionLinkType = {
		Auction: ''
	};

processEnumObject(TransactionType);
processEnumObject(TransactionSide);
processEnumObject(TransactionLinkType);

module.exports = function (sequelize) {
	const DataTypes = sequelize.Sequelize;

	return sequelize.define('Transaction', {
		date: {
			type: DataTypes.DATE,
			allowNull: false
		},
		type: {
			type: DataTypes.ENUM({values: Object.keys(TransactionType)}),
			allowNull: false
		},
		side: {
			type: DataTypes.ENUM({values: Object.keys(TransactionSide)}),
			allowNull: false
		},
		amount: {
			type: DataTypes.DOUBLE,
			allowNull: false
		},
		reference: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'N/A'
		},
		details: {
			type: DataTypes.STRING,
			allowNull: false
		},
		linkType: {
			type: DataTypes.ENUM({values: Object.keys(TransactionLinkType)})
		},
		linkId: {
			type: DataTypes.INTEGER
		},
		cancelReason: {
			type: DataTypes.STRING
		},
		context: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {
				isInvited: false,
				isRecurring: false,
				hasLicense: false
			}
		},
		isCanceled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		classMethods : {
			getPending: function*(companyId, asOfDate) {
				return yield this.findAll({
					where : {
						CompanyId: companyId,
						InvoiceId: null,
						date: {
							$lte: asOfDate
						}
					}
				});
			},

			get: function*(companyId, criteria) {
				let fields = ['type',  'InvoiceId', 'amount', 'date'];
				let query = prepareQuery(criteria, fields, {id: -1});
				query.where = sequelize.and(
					query.where,
					{
						CompanyId: companyId,
						type: TransactionType.Invoice
					}
				);
				query.include = [
					{
						association: this.associations.Invoice,
						attributes: ['invoiceNumber', 'type']
					},
					{
						association: this.associations.User,
						attributes: ['id', 'fullName']
					},
					{
						association: this.associations.Rejector,
						attributes: ['id', 'fullName']
					}
				];

				let entries = yield this.findAndCountAll(query);

				return {
					data: entries.rows,
					count: entries.count
				};
			},

			duplicateFromProforma: function*(transactions) {
				return yield transactions.map(t => {
					let newTransaction = t.toJSON();

					delete newTransaction.id;
					delete newTransaction.InvoiceId;

					newTransaction.type = TransactionType.Invoice;

					return this.create(newTransaction);
				});
			},

			calculateTotal: function(transactions) {
				return _.reduce(transactions, function(total, n) {return total + n.amount}, 0);
			},

			setInvoiceId: function*(transactions, invoiceId){
				for(let t of transactions){
					t.InvoiceId = invoiceId;

					yield t.save();
				}
			},

			associate: function(models) {
				this.belongsTo(models.Invoice);
				this.belongsTo(models.User);
				this.belongsTo(models.User, {as: 'Rejector'});
				this.belongsTo(models.Company, {foreignKey: {notNull: true}});
			},

			ready: function() {
				this.addScope('withEntries', {
					include:[
						{association: sequelize.models.Invoice.associations.JournalEntries}
					]
				});
			}
		},

		instanceMethods: {}
	});
};

module.exports.TransactionType = TransactionType;
module.exports.TransactionSide = TransactionSide;
module.exports.TransactionLinkType = TransactionLinkType;