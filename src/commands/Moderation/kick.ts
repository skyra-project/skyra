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
		if (!member.kickable) throw message.language.tget('COMMAND_KICK_NOT_KICKABLE');
		await member.kick(reason);
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
