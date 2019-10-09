import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_KICK_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_KICK_EXTENDED'),
			modType: ModerationTypeKeys.Kick,
			permissionLevel: 5,
			requiredGuildPermissions: ['KICK_MEMBERS'],
			requiredMember: true
		});
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, member: SkyraGuildMember, reason: string) {
		if (!member.kickable) throw message.language.get('COMMAND_KICK_NOT_KICKABLE');
		await member.kick(reason);
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
