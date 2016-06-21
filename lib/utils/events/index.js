/**
 * Created by yordan on 6/8/16.
 */
'use strict';

const SyncEvent = require('./syncEvent');
const CompositeEvent = require('./compositeSyncEvent');

module.exports = {
	SyncEvent,
	CompositeEvent,
	any: function (events) {
		return new CompositeEvent(events);
	}
};

