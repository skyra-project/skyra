import Collection from '@discordjs/collection';
import { DbSet } from '@lib/database';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import type { GuildMessage } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { DEV } from '@root/config';
import { cutText } from '@sapphire/utilities';
import { BrandingColors } from '@utils/constants';
import { Markov, WordBank } from '@utils/External/markov';
import { getAllContent, iteratorAt, pickRandom } from '@utils/util';
import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import { CommandStore, Language, Stopwatch } from 'klasa';

const kCodeA = 'A'.charCodeAt(0);
const kCodeZ = 'Z'.charCodeAt(0);

export default class extends SkyraCommand {
	private readonly kMessageHundredsLimit = 10;
	private readonly kInternalCache = new WeakMap<TextChannel, Markov>();
	private readonly kInternalMessageCache = new WeakMap<TextChannel, Collection<string, Message>>();
	private readonly kInternalMessageCacheTTL = 120000;
	private readonly kInternalUserCache = new Map<string, Markov>();
	private readonly kInternalCacheTTL = 60000;
	private readonly kBoundUseUpperCase: (wordBank: WordBank) => string;
	private readonly kProcess: (message: GuildMessage, language: Language, markov: Markov) => Promise<MessageEmbed>;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Fun.MarkovDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Fun.MarkovExtended),
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS', 'READ_MESSAGE_HISTORY'],
			usage: '[channel:channelname{2}] [user:username]'
		});

		this.kBoundUseUpperCase = this.useUpperCase.bind(this);
		this.kProcess = DEV ? this.processDevelopment.bind(this) : this.processRelease.bind(this);
	}

	public async run(message: GuildMessage, [channnel, username]: [TextChannel?, User?]) {
		const language = await message.fetchLanguage();

		// Send loading message
		await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		// Process the chain
		return message.sendEmbed(
			await this.kProcess(message, language, await this.retrieveMarkov(language, username, channnel ?? (message.channel as TextChannel)))
		);
	}

	private async processRelease(message: GuildMessage, _: Language, markov: Markov) {
		return new MessageEmbed().setDescription(cutText(markov.process(), 2000)).setColor(await DbSet.fetchColor(message));
	}

	private async processDevelopment(message: GuildMessage, language: Language, markov: Markov) {
		const time = new Stopwatch();
		const chain = markov.process();
		time.stop();

		return new MessageEmbed()
			.setDescription(cutText(chain, 2000))
			.setColor(await DbSet.fetchColor(message))
			.setFooter(language.get(LanguageKeys.Commands.Fun.MarkovTimer, { timer: time.toString() }));
	}

	private async retrieveMarkov(language: Language, user: User | undefined, channel: TextChannel) {
		const entry = user ? this.kInternalUserCache.get(`${channel.id}.${user.id}`) : this.kInternalCache.get(channel);
		if (typeof entry !== 'undefined') return entry;

		const messageBank = await this.fetchMessages(channel, user);
		if (messageBank.size === 0) throw language.get(LanguageKeys.Commands.Fun.MarkovNoMessages);
		const contents = messageBank.map(getAllContent).join(' ');
		const markov = new Markov().parse(contents).start(this.kBoundUseUpperCase).end(60);
		if (user) this.kInternalUserCache.set(`${channel.id}.${user.id}`, markov);
		else this.kInternalCache.set(channel, markov);
		this.client.setTimeout(
			() => (user ? this.kInternalUserCache.delete(`${channel.id}.${user.id}`) : this.kInternalCache.delete(channel)),
			this.kInternalCacheTTL
		);
		return markov;
	}

	private async fetchMessages(channel: TextChannel, user: User | undefined) {
		let messageBank: Collection<string, Message> | undefined = undefined;

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

		return user ? messageBank.filter((message) => message.author.id === user.id) : messageBank;
	}

	private useUpperCase(wordBank: WordBank) {
		let code = 0;
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
