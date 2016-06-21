/**
 * Created by yordan on 6/7/16.
 */
'use strict';

const co = require('co');
const _ = require('lodash');
const log = require('../logger')('syncEvents');
const util = require('util');

class SyncEvent {
	constructor(name) {
		this.name = name;
		this.listeners = [];
	}

	addListener(listener, name) {
		listener.listenerName = listener.name || name;
		this.listeners.push(listener);
		log.trace(`Listener [${name}] added to ${this.name}, ${this.listeners.length} listener(s)`);
	}

	*fire() {
		var self = this;
		let args = arguments, i = 0;

		log.trace(`Fired ${self.name}. Registered Listeners: ${self.listeners.length}`);
		try {
			// Sequential run
			for(let l of self.listeners){
				log.trace(`Running EventListener: [${self.name}.${l.listenerName}] (${++i}/${self.listeners.length})`);
				let p = l.apply(self, args);
				if(p) yield p;
			}
			// Parallel run
		} catch (ex) {
			log.error(`Event ${self.name}`, ex.stack, util.inspect(args, { colors: true }));
			throw ex;
		}

		log.trace(`Finished processing ${self.name}, executed ${self.listeners.length} listener(s)`);
	}
}

module.exports = SyncEvent;