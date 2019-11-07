import { CommandStore, KlasaMessage, Stopwatch } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Markov, WordBank } from '../../lib/util/External/markov';
import { cutText, getColor } from '../../lib/util/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { BrandingColors } from '../../lib/util/constants';

const kCodeA = 'A'.charCodeAt(0);
const kCodeZ = 'Z'.charCodeAt(0);

export default class extends SkyraCommand {

	private readonly kMessageHundredsLimit = 10;
	private readonly kInternalCache = new WeakMap<TextChannel, Markov>();
	private readonly kInternalCacheTTL = 60000;
	private readonly kBoundUseUpperCase = this.useUpperCase.bind(this);

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: language => language.tget('COMMAND_MARKOV_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MARKOV_EXTENDED'),
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS', 'READ_MESSAGE_HISTORY']
		});
	}

	public async run(message: KlasaMessage) {
		// Send loading message
		await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		// Process the chain
		const markov = await this.retrieveMarkov(message);
		const time = new Stopwatch();
		const chain = markov.process();
		time.stop();

		// Send the result message
		return message.sendMessage(new MessageEmbed()
			.setDescription(cutText(chain, 2000))
			.setColor(getColor(message))
			.setFooter(message.language.tget('COMMAND_MARKOV_TIMER', time.toString())));
	}

	private async retrieveMarkov(message: KlasaMessage) {
		const entry = this.kInternalCache.get(message.channel as TextChannel);
		if (typeof entry !== 'undefined') return entry;

		const messageBank = await this.fetchMessages(message);
		const contents = messageBank.map(m => m.content).join(' ');
		const markov = new Markov()
			.parse(contents)
			.start(this.kBoundUseUpperCase)
			.end(60);
		this.kInternalCache.set(message.channel as TextChannel, markov);
		this.client.setTimeout(() => this.kInternalCache.delete(message.channel as TextChannel), this.kInternalCacheTTL);
		return markov;
	}

	private async fetchMessages(message: KlasaMessage) {
		let messageBank = await message.channel.messages.fetch({ limit: 100 });
		for (let i = 1; i < this.kMessageHundredsLimit; ++i) {
			messageBank = messageBank.concat(await message.channel.messages.fetch({ limit: 100, before: messageBank.lastKey() }));
		}

		return messageBank;
	}

	private useUpperCase(wordBank: WordBank) {
		let code: number;
		const filtered: string[] = [];
		for (const key of wordBank.keys()) {
			code = key.charCodeAt(0);
			if (code >= kCodeA && code <= kCodeZ) filtered.push(key);
		}

		return filtered[Math.floor(Math.random() * filtered.length)];
	}

}
