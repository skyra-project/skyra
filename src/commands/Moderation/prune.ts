import { User, Message, MessageAttachment, MessageEmbed, EmbedField, Collection, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp, KlasaUser, KlasaGuild } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { APIErrors, Moderation } from '../../lib/util/constants';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { floatPromise, cleanMentions } from '../../lib/util/util';

export default class extends SkyraCommand {

	private readonly timestamp = new Timestamp('YYYY/MM/DD hh:mm:ss');
	private readonly kColor = Moderation.metadata.get(Moderation.TypeCodes.Prune)!.color;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['p', 'purge', 'nuke', 'sweep'],
			cooldown: 5,
			description: language => language.tget('COMMAND_PRUNE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_PRUNE_EXTENDED'),
			permissionLevel: 5,
			flagSupport: true,
			requiredPermissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '[limit:integer{1,100}] [link|invite|bots|you|me|upload|user:user]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [limit = 50, filter]: [number, string]) {
		// This can happen for a large variety of situations:
		// - Invalid limit (less than 1 or more than 100).
		// - Invalid filter
		// For example `prune 642748845687570444` (invalid ID) or `prune u` (invalid filter)
		// are invalid command usages and therefore, for the sake of protection, Skyra should
		// not execute an erroneous command.
		if (message.args.length > 2) throw message.language.tget('COMMAND_PRUNE_INVALID');

		let messages = await message.channel.messages.fetch({ limit: 100, before: message.id });
		if (typeof filter !== 'undefined') {
			const user = typeof filter === 'string' ? null : filter;
			const type = typeof filter === 'string' ? filter : 'user';
			messages = messages.filter(this.getFilter(message, type, user));
		}
		const now = Date.now();
		const filtered = [...messages.filter(m => now - m.createdTimestamp < 1209600000).keys()].slice(0, limit);

		if (filtered.length === 0) throw message.language.tget('COMMAND_PRUNE_NO_DELETES');

		const deletedMessages = await message.channel.bulkDelete(filtered).catch(error => {
			if (error.code === APIErrors.UnknownMessage) return new Collection<string, Message>();
			throw error;
		});

		if (deletedMessages.size === 0) throw message.language.tget('COMMAND_PRUNE_NO_DELETES');

		floatPromise(this, this.sendPruneLogs(message, deletedMessages));
		return message.sendLocale('COMMAND_PRUNE', [filtered.length, limit]);
	}

	private getFilter(message: Message, filter: string, user: User | null) {
		switch (filter) {
			case 'links':
			case 'link': return (mes: Message) => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
			case 'invites':
			case 'invite': return (mes: Message) => /(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/\w+/.test(mes.content);
			case 'bots':
			case 'bot': return (mes: Message) => mes.author.bot;
			case 'you': return (mes: Message) => mes.author.id === this.client.user!.id;
			case 'me': return (mes: Message) => mes.author.id === message.author.id;
			case 'uploads':
			case 'upload': return (mes: Message) => mes.attachments.size > 0;
			case 'humans':
			case 'human':
			case 'user': return (mes: Message) => mes.author.id === user!.id;
			default: return () => true;
		}
	}

	private async sendPruneLogs(message: KlasaMessage, messages: Collection<string, Message>) {
		const channelID = message.guild!.settings.get(GuildSettings.Channels.PruneLogs);
		if (channelID === null) return;

		const channel = message.guild!.channels.get(channelID) as TextChannel | undefined;
		if (typeof channel === 'undefined') {
			await message.guild!.settings.reset(GuildSettings.Channels.PruneLogs);
			return;
		}

		if (channel.attachable) {
			await channel.sendMessage('', {
				embed: new MessageEmbed()
					.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 64 }))
					.setDescription(message.language.tget('COMMAND_PRUNE_LOG_MESSAGE', message.channel.toString(), message.author.toString(), messages.size))
					.setColor(this.kColor)
					.setTimestamp(),
				files: [
					this.generateAttachment(message, messages)
				]
			});
		}
	}

	private generateAttachment(message: KlasaMessage, messages: Collection<string, Message>) {
		const header = message.language.tget('COMMAND_PRUNE_LOG_HEADER');
		const processed = messages.map(message => this.formatMessage(message)).reverse().join('\n\n');
		const buffer = Buffer.from(`${header}\n\n${processed}`);
		return new MessageAttachment(buffer, 'prune.txt');
	}

	private formatMessage(message: Message) {
		const header = this.formatHeader(message);
		const content = this.formatContents(message);
		return `${header}\n${content}`;
	}

	private formatHeader(message: Message) {
		return `${this.formatTimestamp(message.createdTimestamp)} ${message.system ? 'SYSTEM' : this.formatAuthor(message.author)}`;
	}

	private formatTimestamp(timestamp: number) {
		return `[${this.timestamp.displayUTC(timestamp)}]`;
	}

	private formatAuthor(author: KlasaUser) {
		return `${author.tag}${author.bot ? ' [BOT]' : ''}`;
	}

	private formatContents(message: Message) {
		const output: string[] = [];
		if (message.content.length > 0) output.push(this.formatContent(message.guild!, message.content));
		if (message.embeds.length > 0) output.push(message.embeds.map(embed => this.formatEmbed(message.guild!, embed)).join('\n'));
		if (message.attachments.size > 0) output.push(message.attachments.map(attachment => this.formatAttachment(attachment)).join('\n'));
		return output.join('\n');
	}

	private formatContent(guild: KlasaGuild, content: string) {
		return cleanMentions(guild, content)
			.split('\n')
			.map(line => `> ${line}`)
			.join('\n');
	}

	private formatAttachment(attachment: MessageAttachment) {
		return `📂 [${attachment.name}: ${attachment.url}]`;
	}

	private formatEmbed(guild: KlasaGuild, embed: MessageEmbed) {
		switch (embed.type) {
			case 'video': return this.formatEmbedVideo(embed);
			case 'image': return this.formatEmbedImage(embed);
			default: return this.formatEmbedRich(guild, embed);
		}
	}

	private formatEmbedVideo(embed: MessageEmbed) {
		return `📹 [${embed.url}]${typeof embed.provider === 'undefined' ? '' : ` From ${embed.provider.name}.`}`;
	}

	private formatEmbedImage(embed: MessageEmbed) {
		return `🖼️ [${embed.url}]${typeof embed.provider === 'undefined' ? '' : ` From ${embed.provider.name}.`}`;
	}

	private formatEmbedRich(guild: KlasaGuild, embed: MessageEmbed) {
		if (typeof embed.provider === 'undefined') {
			const output: string[] = [];
			if (embed.title) output.push(this.formatEmbedRichTitle(embed.title));
			if (embed.author) output.push(this.formatEmbedRichAuthor(embed.author));
			if (embed.url) output.push(this.formatEmbedRichUrl(embed.url));
			if (embed.description) output.push(this.formatEmbedRichDescription(guild, embed.description));
			if (embed.fields.length > 0) output.push(embed.fields.map(field => this.formatEmbedRichField(guild, field)).join('\n'));
			return output.join('\n');
		}

		return this.formatEmbedRichProvider(embed);
	}

	private formatEmbedRichTitle(title: string) {
		return `># ${title}`;
	}

	private formatEmbedRichUrl(url: string) {
		return `> 📎 ${url}`;
	}

	private formatEmbedRichAuthor(author: Exclude<MessageEmbed['author'], null>) {
		return `> 👤 ${author.name || '-'}${author.iconURL ? ` [${author.iconURL}]` : ''}${author.url ? ` <${author.url}>` : ''}`;
	}

	private formatEmbedRichDescription(guild: KlasaGuild, description: string) {
		return cleanMentions(guild, description)
			.split('\n')
			.map(line => `> > ${line}`)
			.join('\n');
	}

	private formatEmbedRichField(guild: KlasaGuild, field: EmbedField) {
		return `> #> ${field.name}\n${cleanMentions(guild, field.value)
			.split('\n')
			.map(line => `>  > ${line}`)
			.join('\n')}`;
	}

	private formatEmbedRichProvider(embed: MessageEmbed) {
		return `🔖 [${embed.url}]${typeof embed.provider === 'undefined' ? '' : ` From ${embed.provider.name}.`}`;
	}

}
