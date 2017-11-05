const { structures: { Command }, management: { ModerationLog } } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 2,
			botPerms: ['EMBED_LINKS'],
			mode: 2,
			cooldown: 5,

			usage: '<Case:integer>',
			description: 'Get the information from a case by its index.'
		});
	}

	async run(msg, [index], settings, i18n) {
		const cases = await settings.moderation.getCases();

		if (!cases[index]) throw i18n.get('COMMAND_REASON_NOT_EXISTS');
		return new ModerationLog(msg.guild)
			.retrieveModLog(index).then(embed => msg.send({ embed }));
	}

};
