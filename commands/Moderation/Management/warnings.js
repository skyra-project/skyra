const { Command, Moderation: { schemaKeys, typeKeys }, RichDisplay } = require('../../../index');

const WARNING_FILTER = {
	[schemaKeys.TYPE]: typeKeys.WARN,
	[schemaKeys.APPEAL]: false
};
const RH_TIMELIMIT = 30000;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_WARNINGS_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_WARNINGS_EXTENDED'),
			permLevel: 5,
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	async run(msg, [target]) {
		/** @type {Array<Object<string, *>>} */
		const warnings = await this.client.moderation.getCases(msg.guild.id, target
			? { [schemaKeys.USER]: target.id, ...WARNING_FILTER } : WARNING_FILTER);
		if (!warnings.length) throw msg.language.get('COMMAND_WARNINGS_EMPTY');

		const display = new RichDisplay(new this.client.methods.Embed()
			.setColor(msg.member.displayColor)
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setTitle(msg.language.get('COMMAND_WARNINGS_AMOUNT', warnings.length)));

		const pages = Math.ceil(warnings.length / 10);

		// Fetch usernames
		const users = new Map();
		for (const warning of warnings) {
			const id = warning[schemaKeys.MODERATOR];
			if (!users.has(id)) users.set(id, await this.client.fetchUsername(id));
		}

		// Set up the formatter
		const format = this.displayWarning.bind(this, users);

		// Run the MessageEmbed
		for (let i = 0; i < pages; i++) display.addPage(template => template.setDescription(warnings
			.slice(i * 10, (i * 10) + 10)
			.map(format)));

		return display.run(await msg.sendMessage(msg.language.get('SYSTEM_PROCESSING')), { filter: (reaction, user) => user === msg.author, time: RH_TIMELIMIT });
	}

	displayWarning(users, warning) {
		return `Case \`${warning[schemaKeys.CASE]}\`. Moderator: **${users.get(warning[schemaKeys.MODERATOR])}**.\n${warning[schemaKeys.REASON]}`;
	}

};
