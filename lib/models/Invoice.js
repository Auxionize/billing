'use strict';

const _ = require('lodash'),
	moneyspell = require('moneyspell'),
	processEnumObject = require('../utils/enum').processEnumObject;
let db,
	InvoiceType = {
		Proforma: '' ,
		Invoice: ''
	},
	InvoiceStatus = {
		Active: '' ,
		Canceled: ''
	};

processEnumObject(InvoiceType);
processEnumObject(InvoiceStatus);

module.exports = function (sequelize) {
	const DataTypes = sequelize.Sequelize;

	return sequelize.define('Invoice', {
		status: {
			type: DataTypes.ENUM({values: Object.keys(InvoiceStatus)}),
			allowNull: false,
			defaultValue: InvoiceStatus.Active
		},

		invoiceNumber: {
			type: DataTypes.STRING,
			allowNull: true
		},

		derivedInvoiceNumber: {
			type: DataTypes.VIRTUAL,
			sqlExpr: function (alias) {
				return sequelize.literal(`case
					when "${alias}"."type"='Invoice' then "${alias}"."invoiceNumber"
					when "${alias}"."type"='Proforma' then 'P'||"${alias}"."id"
					end`);
			}
		},

		date: {
			type: DataTypes.DATE,
			allowNull: false
		},

		note: {
			type: DataTypes.STRING,
			allowNull: false
		},

		paymentDueDate: {
			type: DataTypes.DATE
		},

		// --- proforma fields --
		type: {
			type: DataTypes.ENUM({values: Object.keys(InvoiceType)}),
			allowNull: false
		},

		activationType: {
			type: DataTypes.STRING
		},

		activationId: {
			type: DataTypes.INTEGER
		},

		fullInvoiceId: {
			type: DataTypes.INTEGER
		},

		fullInvoiceNumber: {
			type: DataTypes.INTEGER
		},

		// --- amount attributes ---
		totalCharges: {
			type: DataTypes.DOUBLE,
			allowNull: false
		},

		prepayment: {
			type: DataTypes.DOUBLE,
			defaultValue: 0,
			allowNull: false
		},

		subTotal: {
			type: DataTypes.VIRTUAL,
			sqlExpr: function (alias) {
				return sequelize.literal(`"${alias}"."totalCharges" + "${alias}"."prepayment"`);
			}
		},

		tax: {
			type: DataTypes.DOUBLE,
			allowNull: false
		},

		total: {
			type: DataTypes.VIRTUAL,
			sqlExpr: function (alias) {
				return sequelize.literal(`"${alias}"."totalCharges" + "${alias}"."prepayment" + "${alias}"."tax"`);
			}
		},

		totalInWords : {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {
				bg: '',
				en: ''
			}
		},


		// --- Payment attributes -----------
		payment: {
			type: DataTypes.DOUBLE,
			defaultValue: 0,
			allowNull: false
		},

		due: {
			type: DataTypes.VIRTUAL,
			sqlExpr: function (alias) {
				return sequelize.literal(`"${alias}"."totalCharges" + "${alias}"."prepayment" + "${alias}"."tax" - "${alias}"."payment"`);
			}
		},

		proformaId: {
			type: DataTypes.INTEGER,
			allowNull: true
		},

		// --- Buyer Cache Fields ------------
		buyerCompanyName: {
			type: DataTypes.STRING
		},

		buyerResponsiblePerson: {
			type: DataTypes.STRING
		},

		buyerBulstatNumber: {
			type: DataTypes.STRING
		},

		buyerVatNumber: {
			type: DataTypes.STRING
		},


		// --- Seller Cache Fields ------------
		sellerCompanyName: {
			type: DataTypes.STRING
		},

		sellerResponsiblePerson: {
			type: DataTypes.STRING
		},

		sellerBulstatNumber: {
			type: DataTypes.STRING
		},

		sellerVatNumber: {
			type: DataTypes.STRING
		},

		cancelReason: {
			type: DataTypes.STRING(10000),
			allowNull: true
		},

		cancelDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		}

	}, {
		instanceMethods : {
			getBalance: function() {
				return this.due;
			},
			getNumber: function() {
				return this.type === 'Proforma' ? 'P' + this.id : this.invoiceNumber;
			},
			isProforma: function() {
				return this.type == 'Proforma';
			},
			isInvoice: function() {
				return this.type == 'Invoice';
			},
			calcTotalInWords: function() {
				let inWordsBg = moneyspell('bg')(this.total, 'BGN');
				let inWordsEn = moneyspell('en')(this.total, 'BGN');

				this.totalInWords = {
					bg: inWordsBg,
					en: inWordsEn
				};
			},

			recalcSellerAddress: function*() {
				let CompanyModel = sequelize.models.Company;
				let aux = yield CompanyModel.findById(1, {include: [
					{association: CompanyModel.associations.Wallet}
				]});
				this.SellerAddressId = (yield sequelize.models.Address.copy(aux.Wallet.BillingAddressId)).id;
			},

			recalcBuyerAddress: function*() {
				let CompanyModel = sequelize.models.Company;
				let company = yield CompanyModel.findById(this.CompanyId, {include: [{association: CompanyModel.associations.Wallet}]});
				if(!company){
					return;
				}

				let companyAddressId = company.Wallet.BillingAddressId || company.businessAddressId;

				this.BuyerAddressId = (yield sequelize.models.Address.copy(companyAddressId)).id;
			}

		},
		classMethods : {
			associate: function(models) {
				this.belongsTo(models.Company);
				this.hasMany(models.Transaction);
				this.belongsTo(models.Address, {
					as: "BuyerAddress"
				});
				this.belongsTo(models.Address, {
					as: "SellerAddress"
				});
				this.belongsTo(models.User, {as: 'Rejector'});
				this.belongsTo(this, {as: 'Proforma', foreignKey: 'proformaId'});
			},

			ready: function(){
				this.addScope('withTransactions', {
					include:[
						{association: this.associations.Transactions},
						{association: this.associations.BuyerAddress},
						{association: this.associations.SellerAddress}
					]
				});
				db = sequelize.models;
			},


			createWithCache: function*(data){
				let cacheData = yield this.generateCache(data.CompanyId);
				return yield this.create(_.extend(data, cacheData));
			},

			generateCache: function*(companyId){
				let CompanyModel = sequelize.models.Company;
				let aux = yield CompanyModel.findById(1, {include: [
					{association: CompanyModel.associations.Wallet}
				]});
				let company = yield CompanyModel.findById(companyId, {include: [
					{association: CompanyModel.associations.Wallet}
				]});
				let companyAddressId = company.Wallet.BillingAddressId || company.businessAddressId;

				return {
					buyerCompanyName: company.name,
					buyerBulstatNumber: company.bulstatNumber,
					buyerVatNumber: company.vatNumber,
					BuyerAddressId: (yield  sequelize.models.Address.copy(companyAddressId)).id,
					buyerResponsiblePerson: company.Wallet.responsiblePerson,
					sellerCompanyName: aux.name,
					sellerBulstatNumber: aux.bulstatNumber,
					sellerVatNumber: aux.vatNumber,
					SellerAddressId: (yield  sequelize.models.Address.copy(aux.Wallet.BillingAddressId)).id,
					sellerResponsiblePerson: aux.Wallet.responsiblePerson
				};
			},

			/**
			 Generates an invoice from a set of pending charges
			 */
			generateProforma: function*(CompanyId, transactions, activationType, activationId, note) {
				let Transaction = sequelize.models.Transaction;
				let totalCharges = Transaction.calculateTotal(transactions);
				let cacheInvoice = yield this.createWithCache({
					CompanyId,
					invoiceNumber: '',
					totalCharges,
					tax: totalCharges * 0.2,
					date:  new Date().setHours(0, 0, 0, 0),
					type: InvoiceType.Proforma,
					note,
					activationType,
					activationId
				});

				let invoice = yield this.findById(cacheInvoice.id);

				invoice.calcTotalInWords();

				yield invoice.save();
				yield Transaction.setInvoiceId(transactions, invoice.id);

				return invoice;
			},

			generateCreditInvoice: function*(CompanyId, amount, note){

			},

			generateInvoice: function*(CompanyId, transactions, note, asOfDate){
				let Transaction = sequelize.models.Transaction;
				let totalCharges = Transaction.calculateTotal(transactions);

				if(totalCharges < 2.5) return null;

				let invoiceNumber = yield  sequelize.models.VARs.inc('nextInvoice');
				let today = new Date().setHours(0, 0, 0, 0);

				let invoice = yield this.createWithCache({
					CompanyId,
					invoiceNumber,
					note,
					totalCharges,
					tax: totalCharges*0.2,
					payment: 0,
					date: asOfDate,
					paymentDueDate: today,
					type: InvoiceType.Invoice,
					total: totalCharges
				});

				invoice.calcTotalInWords();

				yield invoice.save();
				yield Transaction.setInvoiceId(transactions, invoice.id);

				return invoice;
			},

			invoicePendingTransactions: function*(companyId, note, asOfDate) {
				let pending = yield db.Transaction.getPending(companyId, asOfDate);
				return yield this.generateInvoice(companyId, pending, note, asOfDate);
			},

			getAll: function*(CompanyId) {
				let invoices = yield this.findAndCountAll({
					where : {CompanyId},
					order: ['id']
				});

				return {
					data: invoices.rows,
					count: invoices.count
				};
			}
		}
	});
};

module.exports.InvoiceType = InvoiceType;
module.exports.InvoiceStatus = InvoiceStatus;
