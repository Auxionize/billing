/**
 * Created by rampager on 28.02.17.
 */

'use strict';

let billingEnums = {
	CompanySubscriptionStatus:{
		Pending:{
			key:'Pending',
			code:'P',
			order:1
		},
		Active:{
			key:'Active',
			code:'A',
			order:2
		},
		Expired:{
			key:'Expired',
			code:'E',
			order:3
		}
	},
	InvoiceType:{
		Proforma:{
			key:'Proforma',
			code:'PF',
			order: 1
		},
		Invoice:{
			key:'Invoice',
			code:'IC',
			order: 2
		},
		CreditNote:{
			key:'CreditNote',
			code:'CN',
			order: 3
		}
	},
	InvoiceStatus:{
		Active:{
			key:'Active',
			code:'A',
			order: 1
		},
		Canceled:{
			key:'Canceled',
			code:'C',
			order: 2
		}
	},
	TransactionType:{
		Proforma:{
			key:'Proforma',
			code:'P',
			order: 1
		},
		Invoice:{
			key:'Invoice',
			code:'I',
			order: 2
		},
	},
	TransactionSide:{
		Charge:{
			key:'Charge',
			code:'C',
			order:1
		},
		Payment:{
			key:'Payment',
			code:'P',
			order:2
		},
	},
	TransactionLinkType:{
		Active:{
			key:'Active',
			code:'A',
			order:1
		},
	},
	PaymentType:{
		PAYPAL:{
			key:'PAYPAL',
			code:'PL',
			order:1
		},
		EPAY:{
			key:'EPAY',
			code:'E',
			order:2
		},
		CARD:{
			key:'CARD',
			code:'C',
			order:3
		},
		BANK_WIRE:{
			key:'BANK_WIRE',
			code:'BW',
			order:4
		},
		OTHER:{
			key:'OTHER',
			code:'O',
			order:5
		},
	},
};

module.exports = billingEnums;


