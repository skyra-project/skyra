const { Command, constants: { MODERATION: { TYPE_KEYS } }, UserRichDisplay, MessageEmbed, klasaUtil: { chunk } } = require('../../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_WARNINGS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WARNINGS_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	async run(msg, [target]) {
		const warnings = (await msg.guild.moderation.fetch(target ? target.id : undefined)).filter(log => log.type === TYPE_KEYS.WARN);
		if (!warnings.size) throw msg.language.get('COMMAND_WARNINGS_EMPTY');

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(msg.member.displayColor)
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setTitle(msg.language.get('COMMAND_WARNINGS_AMOUNT', warnings.size)));


		// Fetch usernames
		const users = new Map();
		for (const warning of warnings.values()) {
			const id = warning.moderator;
			if (!users.has(id)) users.set(id, await this.client.fetchUsername(id));
		}

		// Set up the formatter
		const format = this.displayWarning.bind(this, users);

		for (const page of chunk([...warnings.values()], 10))
			display.addPage(template => template.setDescription(page.map(format)));

		await display.run(await msg.sendLocale('SYSTEM_LOADING'), msg.author.id);
		return msg;
	}

	displayWarning(users, warning) {
		return `Case \`${warning.case}\`. Moderator: **${users.get(warning.moderator)}**.\n${warning.reason || 'None'}`;
	}

};
