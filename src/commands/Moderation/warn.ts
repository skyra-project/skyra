import { User } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraGuildMember } from '../../lib/extensions/SkyraGuildMember';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['warning'],
			description: (language) => language.get('COMMAND_WARN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WARN_EXTENDED'),
			modType: ModerationTypeKeys.Warn,
			permissionLevel: 5,
			requiredMember: true
		});
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, _: SkyraGuildMember, reason: string) {
		if (reason && message.guild.settings.get('messages.warnings'))
			user.send(message.language.get('COMMAND_WARN_DM', message.author.tag, message.guild, reason)).catch(() => null);
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
