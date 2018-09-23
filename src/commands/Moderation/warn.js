const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['warning'],
			description: (language) => language.get('COMMAND_WARN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WARN_EXTENDED'),
			modType: ModerationCommand.types.WARN,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<users:...user{,5}> [reason:...string]',
			usageDelim: ' '
		});
	}

	async run(msg, [targets, reason]) {
		const warned = [], errors = [];
		const handle = this._handleMember.bind(this, msg, Boolean(msg.guild.settings.messages.warnings && reason), reason, warned, errors);
		await Promise.all(targets.map(handle));
		return msg.sendMessage(reason && warned.length
			? warned.concat(msg.language.get('MODERATION_REASON_OF', reason), errors)
			: warned.concat(errors));
	}

	async _handleMember(msg, shouldDM, reason, warned, errors, target) {
		try {
			const member = await this.checkModeratable(msg, target);
			if (shouldDM) member.user.send(msg.language.get('COMMAND_WARN_DM', msg.author.tag, msg.guild, reason)).catch(() => null);
			const modlog = await this.sendModlog(msg, target, reason);
			warned.push(msg.language.get('COMMAND_WARN_MESSAGE', member.user, modlog.case));
		} catch (error) {
			errors.push(msg.language.get('COMMAND_WARN_FAILED', target, error));
		}

		return { warned, errors };
	}

};
