const { Command, Moderation, ModerationLog } = require('../../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 5,
			description: 'Get the information from a case by its index.',
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<Case:integer>'
		});
	}

	async run(msg, [index]) {
		const [modlog] = await this.client.moderation.getCases(msg.guild, { [Moderation.schemaKeys.CASE]: index });

		if (!modlog) throw msg.language.get('COMMAND_REASON_NOT_EXISTS');
		const moderator = modlog[Moderation.schemaKeys.MODERATOR]
			? await this.client.users.fetch(modlog[Moderation.schemaKeys.MODERATOR]).catch(() => null)
			: null;
		const user = modlog[Moderation.schemaKeys.USER]
			? await this.client.users.fetch(modlog[Moderation.schemaKeys.USER]).catch(() => null)
			: null;

		return msg.sendEmbed(new ModerationLog(msg.guild)
			.setCaseNumber(modlog[Moderation.schemaKeys.CASE])
			.setDuration(modlog[Moderation.schemaKeys.DURATION])
			.setModerator(moderator)
			.setReason(modlog[Moderation.schemaKeys.REASON])
			.setType(modlog[Moderation.schemaKeys.TYPE])
			.setUser(user)
			.embed);
	}

};
