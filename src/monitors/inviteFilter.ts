import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage, Monitor, SettingsFolder } from 'klasa';

export default class extends Monitor {

	public async run(message: KlasaMessage): Promise<void> {
		if (!message.guild
			|| !/(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(message.content)
			|| await message.hasAtLeastPermissionLevel(5)) return;

		if (message.deletable) {
			await message.nuke();
			await message.alert(message.language.get('MONITOR_NOINVITE', message.author));
		}

		if (!message.guild.settings.get('channels.modlog'))
			return null;

		const channel = message.guild.channels.get(message.guild.settings.get('channels.modlog') as string) as TextChannel;
		if (!channel)
			return message.guild.settings.reset('channels.modlog').then(() => null);

		await channel.send(new MessageEmbed()
			.setColor(0xEFAE45)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.get('CONST_MONITOR_INVITELINK')}`)
			.setTimestamp());
	}

	public shouldRun(message: KlasaMessage): boolean {
		if (!this.enabled || !message.guild || message.author.id === this.client.user.id) return false;

		const selfmod = (message.guild.settings.get('selfmod') as SettingsFolder).pluck('invitelinks', 'ignoreChannels');
		return selfmod.invitelinks && !selfmod.ignoreChannels.includes(message.channel.id);
	}

}
