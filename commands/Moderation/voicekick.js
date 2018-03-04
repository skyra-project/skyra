const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(...args) {
		super(...args, {
			botPerms: ['MANAGE_CHANNELS', 'MOVE_MEMBERS'],
			description: 'Voice kicks the mentioned user.',
			modType: ModerationCommand.types.VOICE_KICK,
			permLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		const member = await this.checkModeratable(msg, target);
		if (!member.voiceChannel) throw msg.language.get('GUILD_MEMBER_NOT_VOICECHANNEL');
		reason = reason.length ? reason.join(' ') : null;

		await this.kickVoiceChannel(msg, member, reason);
		const modlog = await this.sendModlog(msg, target, reason);

		return msg.sendMessage(msg.language.get('COMMAND_VOICEKICK_MESSAGE', target, modlog.reason, modlog.caseNumber));
	}

	async kickVoiceChannel(msg, member, reason) {
		const channel = await msg.guild.channels.create('temp', {
			overwrites: [{ id: msg.guild.id, deny: 0x00000400 }, { id: member.id, allow: 0x00000400 }],
			reason,
			type: 'voice',
			userLimit: 1
		});
		await member.setVoiceChannel(channel);
		await channel.delete('Temporal Voice Channel Deletion');
	}

};
