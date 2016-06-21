/**
 * Created by yordan on 6/7/16.
 */
'use strict';

const bunyan = require('bunyan');
const _ = require('lodash');
const parent = require.parent;
const Sequelize = require('sequelize');

module.exports = function (scopeName) {
	var options = _.merge({}, {name: 'Billing'}, {
		name: scopeName || parent,
		serializers: _.extend({}, bunyan.stdSerializers, {
			/**
			 * Bunyan serializer for Sequelize errors
			 *
			 * @param {Error} err
			 * @returns {object}
			 */
			err: function (err) {
				let logObj = bunyan.stdSerializers.err(err);

				if (err.context) {
					logObj.context = err.context;
				}

				if (err instanceof Sequelize.Error) {
					if (err instanceof Sequelize.DatabaseError) {
						logObj.sql = err.sql;
						logObj.parent = _.omit(err.parent, ['sql']);
					} else if (err instanceof Sequelize.ConnectionError) {
						logObj.parent = _.omit(err.parent, ['sql']);
					}
				}

				return logObj;
			}
		})
	});

	var logger = bunyan.createLogger(options);

	return logger;
};