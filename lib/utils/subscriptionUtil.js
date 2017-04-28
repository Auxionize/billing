/**
 * Created by yordan on 6/23/16.
 */
"use strict";

const _ = require('lodash');
const billingEnums = require('./billingEnums');

// price=null, means visible but cannot be bought
let addDays = function(date, n) {
	let newDate = new Date(date.getTime());

	newDate.setDate(newDate.getDate() + n);

	return newDate;
};
let addMonths = function(date, n) {
	let newDate = new Date(date.getTime());

	newDate.setMonth(newDate.getMonth() + n);

	return newDate;
};


let typeFields = ['ident','name','icon','description','active','optAmount','optDesc'];

class SubscriptionType {
	constructor(details) {
		typeFields.forEach(function(field) {
			if(details[field] === undefined) {
				throw new Error(`Missing subscription type field '${field}'.`);
			}
		});

		_.extend(this, details);
		this.options = [];
		this.get = function(ident){
			let index = _.findIndex(this.options, function(option){
				return option.ident == ident;
			});
			return this.options[index];
		};
	}
	addOption(option){
		this.options.push(option);
	}
}

class SubscriptionOption {
	constructor(details){
		this.ident = details.ident;
		this.name = details.name;
		this.icon = details.icon;
		this.currency = details.currency || 'EUR';
		this.price = details.price;
		this.active = details.active;
		this.amount = details.amount;
		this.description = details.description;
		this.duration = details.duration;
		this.durationMeasure = details.durationMeasure;
		this.description = details.description;
	}

	getExpiration(date) {
		let inc = this.duration;
		switch (this.durationMeasure) {
			case 'day':
				return addDays(date, inc);
				break;
			case 'week':
				return addDays(date, inc*7);
				break;
			case 'month':
				return addMonths(date, inc);
				break;
			case 'year':
				return addMonths(date, inc*12);
				break;
			default:
				console.log(`Wrong measure ${this.durationMeasure}`);
				return date;
		}
	}


}
module.exports.SubscriptionType=SubscriptionType;
module.exports.types = [];
module.exports.get = function(ident){
	let index = _.findIndex(module.exports.types, function(obj){
		return obj.ident == ident;
	});
	return module.exports.types[index];
};
module.exports.types = [];
module.exports.activeTypes = [];
function addType() {
	module.exports.types.push(type);
	if(type.active)
		module.exports.activeTypes.push(type);
}

let PL = new SubscriptionType({
	ident: billingEnums.SubscriptionTypeIdent.PL.key,
	name: 'Buyer\'s License',
	icon: 'fa-shopping-cart',
	description: 'PL_DESCR',
	active: true,
	optAmount: false,
	optDesc: true
});


let TA = new SubscriptionType({
	ident: billingEnums.SubscriptionTypeIdent.TA.key,
	name: 'Trial Auction',
	icon: 'fa-flash',
	description: 'TA_DESCR',
	active: false,
	optAmount: true,
	optDesc: false
});

let MD = new SubscriptionType({
	ident: billingEnums.SubscriptionTypeIdent.MD.key,
	name: 'Negotiations',
	icon: 'fa-list',
	description: 'MD_DESCR',
	active: true,
	optAmount: true,
	optDesc: false
});


let AT = new SubscriptionType({
	ident: billingEnums.SubscriptionTypeIdent.AT.key,
	name: 'Auction Ticket',
	icon: 'fa-ticket',
	description: 'AT_DESCR',
	active: false,
	optAmount: true,
	optDesc: false
});

let SL = new SubscriptionType({
	ident: billingEnums.SubscriptionTypeIdent.SL.key,
	name: 'Seller\'s License',
	icon: 'fa-credit-card',
	description: 'SL_DESCR',
	active: true,
	optAmount: false,
	optDesc: false
});

module.exports.types.push(PL);
module.exports.types.push(TA);
module.exports.types.push(MD);
module.exports.types.push(AT);
module.exports.types.push(SL);

// ---------------------
PL.addOption(new SubscriptionOption({
	ident: 'BASE',
	name: '1 Year',
	price: null,
	active: true,
	duration: 1,
	durationMeasure: 'year',
	description: 'Platform License'
}));

// ---------------------
PL.addOption(new SubscriptionOption({
	ident: 'TEMP1D',
	name: '1 Day',
	price: 0,
	active: false,
	duration: 1,
	durationMeasure: 'day',
	description: 'Platform License'
}));

// ---------------------
PL.addOption(new SubscriptionOption({
	ident: 'TEMP1W',
	name: '1 Week',
	price: 0,
	active: false,
	duration: 1,
	durationMeasure: 'week',
	description: 'Platform License'
}));


PL.addOption(new SubscriptionOption({
	ident: '220K',
	name: '1 Year',
	price: 220,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));

PL.addOption(new SubscriptionOption({
	ident: '500K',
	name: '1 Year',
	price: 350,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));

PL.addOption(new SubscriptionOption({
	ident: '1M',
	name: '1 Year',
	price: 500,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));

PL.addOption(new SubscriptionOption({
	ident: '2M',
	name: '1 Year',
	price: 700,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));

PL.addOption(new SubscriptionOption({
	ident: '5M',
	name: '1 Year',
	price: 1000,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));

PL.addOption(new SubscriptionOption({
	ident: '10M',
	name: '1 Year',
	price: 1500,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));

PL.addOption(new SubscriptionOption({
	ident: '20M',
	name: '1 Year',
	price: 2000,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));

PL.addOption(new SubscriptionOption({
	ident: '50M',
	name: '1 Year',
	price: 3500,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));


PL.addOption(new SubscriptionOption({
	ident: '100M',
	name: '1 Year',
	price: 5000,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));

PL.addOption(new SubscriptionOption({
	ident: 'OVER100M',
	name: '1 Year',
	price: 7000,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));


// ------------------
TA.addOption(new SubscriptionOption({
	ident: 'TRIAL',
	name: 'Trial Auctions',
	price: 0,
	amount: 0,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));


// ------------------
AT.addOption(new SubscriptionOption({
	ident: 'PROMO',
	name: 'Promo Tickets',
	price: 0,
	amount: 10,
	active: false,
	duration: 1,
	durationMeasure: 'year'
}));
AT.addOption(new SubscriptionOption({
	ident: '10T',
	name: '10 Tickets (-10%)',
	price: 9,
	amount: 10,
	active: true,
	duration: 1,
	durationMeasure: 'year'
}));
AT.addOption(new SubscriptionOption({
	ident: '20T',
	name: '20 Tickets (-20%)',
	price: 16,
	amount: 20,
	active: true,
	duration: 1,
	durationMeasure: 'year'
}));
AT.addOption(new SubscriptionOption({
	ident: '50T',
	name: '50 Tickets (-30%)',
	price: 45,
	amount: 50,
	active: true,
	duration: 1,
	durationMeasure: 'year'
}));
AT.addOption(new SubscriptionOption({
	ident: '100T',
	name: '100 Tickets (-40%)',
	price: 60,
	amount: 100,
	active: true,
	duration: 1,
	durationMeasure: 'year'
}));

//---------------------
MD.addOption(new SubscriptionOption({
	ident: 'MD10K',
	name: 'Market Data 5K EUR',
	price: 30,
	active: true,
	amount: 5000,
	duration: 1,
	durationMeasure: 'year'
}));
MD.addOption(new SubscriptionOption({
	ident: 'MD100K',
	name: 'Market Data 50K EUR',
	price: 80,
	active: true,
	amount: 50000,
	duration: 1,
	durationMeasure: 'year'
}));
MD.addOption(new SubscriptionOption({
	ident: 'MD500K',
	name: 'Market Data 250K EUR',
	price: 180,
	active: true,
	amount: 250000,
	duration: 1,
	durationMeasure: 'year'
}));
MD.addOption(new SubscriptionOption({
	ident: 'MD1M',
	name: 'Market Data 500K EUR',
	price: 250,
	active: true,
	amount: 500000,
	duration: 1,
	durationMeasure: 'year'
}));
MD.addOption(new SubscriptionOption({
	ident: 'MDFREEDOM',
	name: 'Market Data Unlimited',
	price: 350,
	active: true,
	amount: null,
	duration: 1,
	durationMeasure: 'year'
}));

// ---------------------

SL.addOption(new SubscriptionOption({
	ident: 'MONTHLY',
	name: 'Monthly',
	price: 45,
	active: true,
	duration: 1,
	durationMeasure: 'month'
}));

SL.addOption(new SubscriptionOption({
	ident: 'YEARLY',
	name: 'Yearly',
	price: 450,
	active: true,
	duration: 1,
	durationMeasure: 'year'
}));