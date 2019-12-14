import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { BrandingColors } from '../../lib/util/constants';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_EMOTES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_EMOTES_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		await this.populateCache(message);

		const animEmotes: string[] = [];
		const staticEmotes: string[] = [];

		for (const [id, emote] of [...message.guild!.emojis.entries()]) {
			if (emote.animated) animEmotes.push(`<a:${emote.name}:${id}>`);
			else staticEmotes.push(`<:${emote.name}:${id}>`);
		}

		const chunkedAnimatedEmojis = this.emotesChunker(animEmotes, 50);
		const chunkedStaticEmojis = this.emotesChunker(staticEmotes, 50);

		const display = this.buildDisplay(message, chunkedAnimatedEmojis, chunkedStaticEmojis);

		await display.start(response, message.author.id);
		return response;
	}

	private emotesChunker(emotes: string[], size: number): string[][] {
		const chunkedEmotes: string[][] = [[]];

		do {
			chunkedEmotes.push(emotes.splice(0, size));
		} while (emotes.length > 0);
		chunkedEmotes.shift();

		return chunkedEmotes;
	}

	private async populateCache(message: KlasaMessage) {
		if (!message.guild!.emojis.size) {
			await message.guild!.fetch();
		}
	}

	private buildDisplay(message: KlasaMessage, animatedEmojis: string[][], staticEmojis: string[][]) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor([
				`${message.guild!.emojis.size}`,
				`${message.language.tget('COMMAND_EMOTES_TITLE')}`,
				`${message.guild!.name}`
			].join(' '), message.guild!.iconURL({ format: 'png' })!));

		for (const chunk of staticEmojis) {
			display.addPage((embed: MessageEmbed) => embed
				.setDescription(chunk.join(' ')));
		}

		for (const chunk of animatedEmojis) {
			display.addPage((embed: MessageEmbed) => embed
				.setDescription(chunk.join(' ')));
		}

		return display;
	}

}
