import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { ModerationTypeKeys } from '../../../lib/util/constants';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_HISTORY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_HISTORY_EXTENDED'),
			permissionLevel: 5,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [target = message.author]: [KlasaUser]) {
		const logs = await message.guild.moderation.fetch(target.id);
		let warnings = 0, mutes = 0, kicks = 0, bans = 0;
		for (const log of logs.values()) {
			if (log.appealed) continue;
			switch (log.type) {
				case ModerationTypeKeys.TemporaryBan:
				case ModerationTypeKeys.Ban:
				case ModerationTypeKeys.Softban: bans++;
					break;
				case ModerationTypeKeys.TemporaryMute:
				case ModerationTypeKeys.Mute: mutes++;
					break;
				case ModerationTypeKeys.Kick: kicks++;
					break;
				case ModerationTypeKeys.Warn: warnings++;
			}
		}

		const index = Math.min(COLORS.length - 1, warnings + mutes + kicks + bans);

		return message.sendEmbed(new MessageEmbed()
			.setColor(COLORS[index])
			.setAuthor(target.username, target.displayAvatarURL())
			.setFooter(message.language.get('COMMAND_HISTORY_FOOTER', warnings, mutes, kicks, bans)));
	}

}

const COLORS = [0x80F31F, 0xA5DE0B, 0xC7C101, 0xE39E03, 0xF6780F, 0xFE5326, 0xFB3244];
