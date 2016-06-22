/**
 * Created by yordan on 6/22/16.
 */
'use strict';

module.exports = function (sequelize) {
	const DataTypes = sequelize.Sequelize;

	return sequelize.define('Wallet', {
			balance: {
				type: DataTypes.DOUBLE,
				default: 0
			},
			responsiblePerson: {
				type: DataTypes.STRING
			}
		}, {
			classMethods : {
				associate: function(models) {
					this.belongsTo(models.Address, {as: 'BillingAddress'});
				},
				getNew: function*() {
					return yield this.create({});
				}
			}
		});
};
