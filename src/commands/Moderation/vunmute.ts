import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_VUNMUTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_VUNMUTE_EXTENDED'),
			modType: ModerationTypeKeys.UnVoiceMute,
			permissionLevel: 5,
			requiredMember: true,
			requiredPermissions: ['MUTE_MEMBERS']
		});
	}

	public async prehandle() { /* Do nothing */ }

	public async handle(message: KlasaMessage, user: User, member: GuildMember, reason: string) {
		if (!member.voice.serverMute) throw message.language.tget('GUILD_MUTE_NOT_FOUND');
		await member.voice.setMute(false, reason);
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
