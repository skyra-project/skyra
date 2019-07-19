import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage, Monitor } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';

const kRegExp = /(discord\.(gg|io|me|li)\/|discordapp\.com\/invite\/)[\w\d]{2,}/i;

export default class extends Monitor {

	public async run(message: KlasaMessage) {
		if (await message.hasAtLeastPermissionLevel(5) || !kRegExp.test(message.content)) return;

		if (message.deletable) {
			await message.nuke();
			await message.alert(message.language.get('MONITOR_NOINVITE', message.author));
		}

		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Moderation, message.guild, () => new MessageEmbed()
			.setColor(0xEFAE45)
			.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL({ size: 128 }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.get('CONST_MONITOR_INVITELINK')}`)
			.setTimestamp());
	}

	public shouldRun(message: KlasaMessage) {
		return this.enabled
			&& message.guild !== null
			&& message.author !== null
			&& message.webhookID !== null
			&& message.content.length > 0
			&& !message.system
			&& message.author.id !== this.client.user!.id
			&& message.guild.settings.get(GuildSettings.Selfmod.Invitelinks) as GuildSettings.Selfmod.Invitelinks
			&& !(message.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels) as GuildSettings.Selfmod.IgnoreChannels).includes(message.channel.id);
	}

}
