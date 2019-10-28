import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['warning'],
			description: language => language.tget('COMMAND_WARN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WARN_EXTENDED'),
			modType: ModerationTypeKeys.Warn,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, _: GuildMember, reason: string) {
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
