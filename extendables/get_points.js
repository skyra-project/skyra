const { Extendable } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['GuildMember'], { name: 'points' });
	}

	get extend() {
		return this.client.handler.social.local.getMember(this.guild.id, this.id);
	}

};
