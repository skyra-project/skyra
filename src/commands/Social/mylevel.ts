const { Command } = require('../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 15,
			description: (language) => language.get('COMMAND_MYLEVEL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MYLEVEL_EXTENDED'),
			runIn: ['text'],
			usage: '[user:username]'
		});

		this.spam = true;
	}

	public async run(msg, [user = msg.author]) {
		const member = await msg.guild.members.fetch(user.id).catch(() => {
			throw msg.language.get('USER_NOT_IN_GUILD');
		});

		if (member.settings._syncStatus) await member.settings._syncStatus;

		const memberPoints = member.settings.count;
		const nextRole = this.getLatestRole(memberPoints, msg.guild.settings.roles.auto);
		const title = nextRole
			? `\n${msg.language.get('COMMAND_MYLEVEL_NEXT', nextRole.points - memberPoints, nextRole.points)}`
			: '';

		return msg.sendLocale('COMMAND_MYLEVEL', [memberPoints, title, user.id === msg.author.id ? null : user.username]);
	}

	public getLatestRole(points, autoroles) {
		for (let i = 0; i < autoroles.length; i++)
			if (autoroles[i].points > points) return autoroles[i];

		return null;
	}

};
