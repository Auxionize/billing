/**
 * Created by yordan on 6/7/16.
 */
'use strict';

const _ = require('lodash');

module.exports.whereIdIn = function(array){
	return {where: {id: {$in: array}}};
};


module.exports.pickAndWarn = function(obj, allowedKeys) {
	_.pick(obj, allowedKeys);
};


function numberToOrder(number) {
	if (number === 1) {
		return 'ASC NULLS LAST';
	}
	if (number === -1) {
		return 'DESC NULLS LAST';
	}
	return null;
}

module.exports.prepareQuery = function(criteria, searchFields, defSort) {
	let paging,
		offset,
		limit;

	criteria = _.defaults(criteria || {}, {
		paging: false
	});

	if(criteria.paging !== false){
		paging=  _.chain({})
			.extend({
				page: 1,
				pageSize: 10
			}, criteria.paging)
			.pick('page', 'pageSize')
			.value();
		offset =  (paging.page - 1) * paging.pageSize;
		limit = paging.pageSize;
	}

	let sortArray = _.pairs(criteria.sorting);
	sortArray = sortArray.concat(_.pairs(defSort));
	let query = {
		where: _.pick(criteria.search, searchFields),
		order: module.exports.prepareOrderOptions(sortArray)
	};
	if(paging !== false){
		query.offset = offset;
		query.limit = limit;
	}
	return query;
};


module.exports.prepareOrderOptions = function(sort) {
	return  _.map(sort, function (item) {
		return [item[0], numberToOrder(item[1])];
	});
};