const { RawEvent } = require('../index');

module.exports = class extends RawEvent {

	/**
	 *  GUILD_MEMBER_UPDATE Packet
	 *  ##########################
	 *	{
	 *		user: {
	 *			username: 'username',
	 *			id: 'id',
	 *			discriminator: 'discriminator',
	 *			avatar: 'avatar'
	 *		},
	 *		roles: ['id'],
	 *		nick: null,
	 *		guild_id: 'id'
	 *	}
	 */

	run(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (guild) {
			guild.memberSnowflakes.add(data.user.id);
			this.client.usernames.set(data.user.id, `${data.user.username}#${data.user.tag}`);
			const member = guild.members.get(data.user.id);
			// @ts-ignore
			if (member) member._patch(data);
		}
	}

};
