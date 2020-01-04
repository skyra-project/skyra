import Collection from '@discordjs/collection';
import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import { CommandStore, KlasaMessage, Stopwatch } from 'klasa';
import { DEV } from '@root/config';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { BrandingColors } from '@util/constants';
import { Markov, WordBank } from '@util/External/markov';
import { cutText, getColor, iteratorAt } from '@util/util';

const kCodeA = 'A'.charCodeAt(0);
const kCodeZ = 'Z'.charCodeAt(0);

export default class extends SkyraCommand {

	private readonly kMessageHundredsLimit = 10;
	private readonly kInternalCache = new WeakMap<TextChannel, Markov>();
	private readonly kInternalMessageCache = new WeakMap<TextChannel, Collection<string, Message>>();
	private readonly kInternalMessageCacheTTL = 120000;
	private readonly kInternalUserCache = new Map<string, Markov>();
	private readonly kInternalCacheTTL = 60000;
	private readonly kBoundUseUpperCase = this.useUpperCase.bind(this);
	private readonly kProcess = DEV ? this.processDevelopment.bind(this) : this.processRelease.bind(this);

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_MARKOV_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MARKOV_EXTENDED'),
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS', 'READ_MESSAGE_HISTORY'],
			usage: '[channel:channelname{2}] [user:username]'
		});
	}

	public async run(message: KlasaMessage, args: [TextChannel?, User?]) {
		// Send loading message
		await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		// Process the chain
		return message.sendEmbed(this.kProcess(message, await this.retrieveMarkov(message, ...args)));
	}

	private processRelease(message: KlasaMessage, markov: Markov) {
		return new MessageEmbed()
			.setDescription(cutText(markov.process(), 2000))
			.setColor(getColor(message));
	}

	private processDevelopment(message: KlasaMessage, markov: Markov) {
		const time = new Stopwatch();
		const chain = markov.process();
		time.stop();

		return new MessageEmbed()
			.setDescription(cutText(chain, 2000))
			.setColor(getColor(message))
			.setFooter(message.language.tget('COMMAND_MARKOV_TIMER', time.toString()));
	}

	private async retrieveMarkov(message: KlasaMessage, channel: TextChannel = message.channel as TextChannel, user: User | undefined) {
		const entry = user ? this.kInternalUserCache.get(`${channel.id}.${user.id}`) : this.kInternalCache.get(channel);
		if (typeof entry !== 'undefined') return entry;

		const messageBank = await this.fetchMessages(channel, user);
		if (messageBank.size === 0) throw message.language.tget('COMMAND_MARKOV_NO_MESSAGES');
		const contents = messageBank.map(m => m.content).join(' ');
		const markov = new Markov()
			.parse(contents)
			.start(this.kBoundUseUpperCase)
			.end(60);
		if (user) this.kInternalUserCache.set(`${channel.id}.${user.id}`, markov);
		else this.kInternalCache.set(channel, markov);
		this.client.setTimeout(() => user ? this.kInternalUserCache.delete(`${channel.id}.${user.id}`) : this.kInternalCache.delete(channel), this.kInternalCacheTTL);
		return markov;
	}

	private async fetchMessages(channel: TextChannel, user: User | undefined) {
		let messageBank: Collection<string, Message>;

		// Check the cache first to speed up and reduce API queries
		const cachedMessageBank = this.kInternalMessageCache.get(channel);
		if (typeof cachedMessageBank === 'undefined') {
			messageBank = await channel.messages.fetch({ limit: 100 });
			for (let i = 1; i < this.kMessageHundredsLimit; ++i) {
				messageBank = messageBank.concat(await channel.messages.fetch({ limit: 100, before: messageBank.lastKey() }));
			}
			this.kInternalMessageCache.set(channel, messageBank);
			this.client.setTimeout(() => this.kInternalMessageCache.delete(channel), this.kInternalMessageCacheTTL);
		} else {
			messageBank = cachedMessageBank;
		}

		return user ? messageBank.filter(message => message.author.id === user.id) : messageBank;
	}

	private useUpperCase(wordBank: WordBank) {
		let code: number;
		const filtered: string[] = [];
		for (const key of wordBank.keys()) {
			code = key.charCodeAt(0);
			if (code >= kCodeA && code <= kCodeZ) filtered.push(key);
		}

		return filtered.length > 0
			? filtered[Math.floor(Math.random() * filtered.length)]
			: iteratorAt(wordBank.keys(), Math.floor(Math.random() * wordBank.size))!;
	}

}
