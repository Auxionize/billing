/**
 * Created by yordan on 6/21/16.
 */
'use strict';

const _ = require('lodash');

module.exports = function(sequelize, enumsOld) {
	const DataTypes = sequelize.Sequelize;

	return sequelize.define('CompanySubscription', {
		status: {
			type: DataTypes.ENUM({values: Object.keys(enums.CompanySubscriptionStatus)}),
			allowNull: false
		},
		typeName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		optionName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		typeIdent: {
			type: DataTypes.STRING,
			allowNull: false
		},
		optionIdent: {
			type: DataTypes.STRING,
			allowNull: false
		},
		remaining: {
			type: DataTypes.DOUBLE
		},
		expiration : {
			type: DataTypes.DATE,
			allowNull: false
		},
		remainingAtExpiration: {
			type: DataTypes.DOUBLE
		},
		autorenew : {
			type: DataTypes.BOOLEAN,
			allowNull: false
		}
	}, {
		classMethods: {
			*activate(id) {
				let subscr = yield this.findById(id);

				let negativeSubscr = yield this.findAll({
					where: {
						CompanyId: subscr.CompanyId,
						typeIdent: subscr.typeIdent,
						remaining: {
							$lt: 0
						}
					}}
				);

				let totalNegative = 0;

				for(let i = 0; i < negativeSubscr.length; i++) {
					let s = negativeSubscr[i];
					totalNegative += s.remaining;
					s.remaining = 0;

					yield s.save();
				}

				subscr.status = 'Active';
				subscr.remaining = subscr.remaining + totalNegative;

				yield subscr.save();
			},
			*hasActive(CompanyId, typeIdent) {
				let subscriptions = yield this.findAll({
					where: {
						CompanyId,
						typeIdent,
						status: enums.CompanySubscriptionStatus.Active.key
					}});

				return subscriptions.length > 0;
			},
			*consume(CompanyId, typeIdent, amount, description, privateDescr) {
				let CompanySubscriptionTransaction = sequelize.models.CompanySubscriptionTransaction;
				let subscriptions = yield this.findAll({
					where: {
						CompanyId,
						typeIdent,
						status: enums.CompanySubscriptionStatus.Active.key
					},
					order: [
						['expiration', 'ASC']
					]
				});

				let lastSubscription;
				let allUpdated = [];
				let totalRemaining = amount;

				for(let n = 0; n < subscriptions.length; n++){
					let s = subscriptions[n];
					lastSubscription = s;
					let deductAmount;

					if(n == subscriptions.length - 1) {
						deductAmount = totalRemaining;
					}
					else {
						deductAmount = Math.min(s.remaining, totalRemaining);
					}

					s.remaining = s.remaining - deductAmount;
					totalRemaining = totalRemaining - deductAmount;

					if(s.remaining < 0.0001) {
						s.status = enums.CompanySubscriptionStatus.Expired.key;
						s.remainingAtExpiration = 0;
					}

					yield s.save();
					allUpdated.push(s);
					if(totalRemaining < 0.0001) break;
				}

				if(lastSubscription) {
					yield CompanySubscriptionTransaction.create({
						amount: -amount,
						description: description,
						privateDescription: privateDescr,
						date: new Date(),
						CompanySubscriptionId: lastSubscription.id
					});
				}

				// no active subscriptions at the time of billing
				if(totalRemaining > 0.0001) {
					yield this.create({
						status: enums.CompanySubscriptionStatus.Expired.key,
						CompanyId: CompanyId,
						typeIdent: typeIdent,
						optionIdent: 'overused',
						typeName: 'overused',
						optionName: 'overused',
						remaining: totalRemaining,
						autorenew: false,
						expiration: new Date()
					});
				}

				return allUpdated;
			},

			*getRemaining(CompanyId, typeIdent, includePending) {
				let statuses = [enums.CompanySubscriptionStatus.Active.key];
				if(includePending) statuses.push(enums.CompanySubscriptionStatus.Pending.key);
				let subscriptions = yield this.findAll({
					where: {
						CompanyId,
						typeIdent,
						status: enums.CompanySubscriptionStatus.Active.key
					}});

				let total = 0;
				for(let sub of subscriptions) {
					if(sub.remaining == null) return null;
					else total += sub.remaining;
				}

				return total;
			},

			/**
			 * Called periodically
			 * (@see scheduler.finishExpiredSubscriptions configuration)
			 * to mark expired auctions
			 * in state ACTIVE as FINISHED
			 *
			 * @param {Date} now
			 */
			*finishExpired(now) {
				let subscriptions = yield this.findAll({
					where: {
						status: enums.CompanySubscriptionStatus.Active.key,
						expiration: {
							$lt: now || Date.now()
						}
					}
				});

				for(let sub of subscriptions){
					sub.status = enums.CompanySubscriptionStatus.Expired.key;
					sub.save();
				}
			},

			associate: function (models) {
				this.belongsTo(models.Company, {foreignKey: {notNull: true}});
			}
		}
	});
};

