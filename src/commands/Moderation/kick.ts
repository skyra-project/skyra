import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_KICK_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_KICK_EXTENDED'),
			modType: ModerationTypeKeys.Kick,
			permissionLevel: 5,
			requiredGuildPermissions: ['KICK_MEMBERS'],
			requiredMember: true
		});
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, member: GuildMember, reason: string) {
		await member.kick(reason);
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

	public async checkModeratable(message: KlasaMessage, target: User, prehandled: unknown) {
		const member = await super.checkModeratable(message, target, prehandled);
		if (member && !member.kickable) throw message.language.tget('COMMAND_KICK_NOT_KICKABLE');
		return member;
	}

}
