/**
 * Created by yordan on 6/7/16.
 */
"use strict";

let testEnumObject = function(obj) {
	let keys = Object.keys(obj);

	for(let key of keys){
		let value = obj[key];
		if(key!==value)
			throw new Error(`Incorrect enum object. Key: ${key}, Value: ${value}`)
	}
};

let processEnumObject = function(obj) {
	let keys = Object.keys(obj);

	for(let key of keys){
		obj[key] = key;
	}
};

module.exports.testEnumObject =testEnumObject;
module.exports.processEnumObject =processEnumObject;

