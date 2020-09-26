import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: 'Manage the Anti-RAID system.',
			permissionLevel: PermissionLevels.Administrator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<clear|cool|show:default>'
		});
	}

	public run(message: KlasaMessage, [type]: ['clear' | 'cool' | 'show']) {
		if (!message.guild!.settings.get(GuildSettings.Selfmod.Raid)) throw message.language.get(LanguageKeys.Commands.Moderation.RaidDisabled);
		if (!message.guild!.me!.permissions.has('KICK_MEMBERS')) throw message.language.get(LanguageKeys.Commands.Moderation.RaidMissingKick);

		return this[type](message);
	}

	public show(message: KlasaMessage) {
		const { raid } = message.guild!.security;
		const embed = new MessageEmbed()
			.setTitle(message.language.get(LanguageKeys.Commands.Moderation.RaidList))
			.setDescription([...raid.keys()].map((user) => `<@${user}>`))
			.setFooter(`${raid.size}/${message.guild!.settings.get(GuildSettings.Selfmod.Raidthreshold)} ${message.language.get('constUsers')}`)
			.setTimestamp();

		return message.sendMessage({ embed });
	}

	public clear(message: KlasaMessage) {
		message.guild!.security.raid.clear();
		return message.sendLocale(LanguageKeys.Commands.Moderation.RaidClear);
	}

	public cool(message: KlasaMessage) {
		message.guild!.security.raid.stop();
		return message.sendLocale(LanguageKeys.Commands.Moderation.RaidCool);
	}
}
