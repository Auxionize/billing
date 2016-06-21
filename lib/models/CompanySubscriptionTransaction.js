/**
 * Created by yordan on 6/21/16.
 */
'use strict';

module.exports = function (sequelize) {
	const DataTypes = sequelize.Sequelize;

	return sequelize.define('CompanySubscriptionTransaction', {
		amount: {
			type: DataTypes.DOUBLE,
			allowNull: false
		},
		description : {
			type: DataTypes.STRING,
			allowNull: false
		},
		privateDescription : {
			type: DataTypes.STRING
		},
		date : {
			type: DataTypes.DATE,
			allowNull: false
		},
		hidden : {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		}
	}, {
		classMethods: {
			generate: function*(type, amount, date) {
				this.create({type, amount, date});
			},

			associate: function (models) {
				this.belongsTo(models.CompanySubscription, {
					foreignKey: {
						notNull: true
					}
				});
			}
		}
	});
};
