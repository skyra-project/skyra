const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 15,
			description: msg => msg.language.get('COMMAND_MYLEVEL_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_MYLEVEL_EXTENDED'),
			runIn: ['text'],
			usage: '[user:username]'
		});

		this.spam = true;
	}

	async run(msg, [user = msg.author]) {
		const member = await msg.guild.members.fetch(user.id).catch(() => {
			throw msg.language.get('USER_NOT_IN_GUILD');
		});

		if (member.configs._syncStatus) await member.configs._syncStatus;

		const memberPoints = member.configs.count;
		const nextRole = this.getLatestRole(memberPoints, msg.guild.configs.roles.auto);
		const title = nextRole
			? `\n${msg.language.get('COMMAND_MYLEVEL_NEXT', nextRole.points - memberPoints, nextRole.points)}`
			: '';

		return msg.sendLocale('COMMAND_MYLEVEL', [memberPoints, title, user.id === msg.author.id ? null : user.username]);
	}

	getLatestRole(points, autoroles) {
		for (let i = 0; i < autoroles.length; i++)
			if (autoroles[i].points > points) return autoroles[i];


		return null;
	}

};
