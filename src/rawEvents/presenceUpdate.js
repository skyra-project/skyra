const { RawEvent } = require('../index');

module.exports = class extends RawEvent {

	/**
	 *	PRESENCE_UPDATE Packet
	 *	######################
	 *	{
	 *		user: { id: 'id' },
	 *		status: 'online',
	 *		roles: ['id', 'id'],
	 *		nick: null,
	 *		guild_id: 'id',
	 *		game: {
	 *			type: 0,
	 *			name: 'name',
	 *			id: 'id',
	 *			created_at: 1539082424553
	 *		},
	 *		activities: [{
	 *			type: 0,
	 *			name: 'name',
	 *			id: 'id',
	 *			created_at: 1539082424553
	 *		}]
	 *	}
	 */

	run(data) {
		const user = this.client.users.get(data.user.id);
		// @ts-ignore
		if (user) user._patch(data.user);
	}

};
