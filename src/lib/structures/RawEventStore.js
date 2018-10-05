/// <reference path="../../index.d.ts" />
const { Store } = require('klasa');
const RawEvent = require('./RawEvent');

class RawEventStore extends Store {

	constructor(client) {
		super(client, 'rawEvents', RawEvent);
	}

}

module.exports = RawEventStore;
