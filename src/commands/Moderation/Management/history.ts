import { Command, constants : { MODERATION: { TYPE_KEYS } }, MessageEmbed; } from; '../../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_HISTORY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_HISTORY_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	public async run(msg, [target = msg.author]) {
		const logs = await msg.guild.moderation.fetch(target.id);
		let warnings = 0, mutes = 0, kicks = 0, bans = 0;
		for (const log of logs.values()) {
			if (log.appealed) continue;
			switch (log.type) {
				case TYPE_KEYS.TEMPORARY_BAN:
				case TYPE_KEYS.BAN:
				case TYPE_KEYS.SOFT_BAN: bans++;
					break;
				case TYPE_KEYS.TEMPORARY_MUTE:
				case TYPE_KEYS.MUTE: mutes++;
					break;
				case TYPE_KEYS.KICK: kicks++;
					break;
				case TYPE_KEYS.WARN: warnings++;
					break;
			}
		}

		const index = Math.min(COLORS.length - 1, warnings + mutes + kicks + bans);

		return msg.sendEmbed(new MessageEmbed()
			.setColor(COLORS[index])
			.setAuthor(target.username, target.displayAvatarURL())
			.setFooter(msg.language.get('COMMAND_HISTORY_FOOTER', warnings, mutes, kicks, bans)));
	}

}

const COLORS = [0x80F31F, 0xA5DE0B, 0xC7C101, 0xE39E03, 0xF6780F, 0xFE5326, 0xFB3244];
