/**
 * Created by yordan on 6/7/16.
 */
'use strict';

const SyncEvent = require('./syncEvent');

class CompositeSyncEvent extends SyncEvent {
	/**
	 * Constructor
	 *
	 * @param {string} name
	 * @param {Array.<SyncEvent>} events
	 */
	constructor(events) {
		super('[' + events.map(event => event.name).join('|') + ']');

		events.forEach(event => {
			event.addListener(this.fire.bind(this));
		});
	}
}

module.exports = CompositeSyncEvent;