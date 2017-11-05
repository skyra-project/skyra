const { structures: { Event } } = require('../index');
const MessageReactionAdd = require('../eventsRaw/messageReactionAdd');

module.exports = class extends Event {

	constructor(...args) {
		super(...args);

		this.messageReactionAdd = new MessageReactionAdd(this.client);
	}

	run(data) {
		switch (data.t) {
			case 'MESSAGE_REACTION_ADD':
				return this.messageReactionAdd.parse(data);
			default:
				return null;
		}
	}

};
