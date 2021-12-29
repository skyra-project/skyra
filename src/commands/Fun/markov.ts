import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { iteratorAt } from '#utils/common';
import { Markov, WordBank } from '#utils/External/markov';
import { getAllContent, sendLoadingMessage } from '#utils/util';
import type Collection from '@discordjs/collection';
import { ApplyOptions } from '@sapphire/decorators';
import { GuildTextBasedChannelTypes, isNsfwChannel } from '@sapphire/discord.js-utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Stopwatch } from '@sapphire/stopwatch';
import { cutText } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed, User } from 'discord.js';
import type { TFunction } from 'i18next';

const kCodeA = 'A'.charCodeAt(0);
const kCodeZ = 'Z'.charCodeAt(0);

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Fun.MarkovDescription,
	detailedDescription: LanguageKeys.Commands.Fun.MarkovExtended,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory]
})
export class UserCommand extends SkyraCommand {
	private readonly kMessageHundredsLimit = 10;
	private readonly kInternalCache = new WeakMap<GuildTextBasedChannelTypes, Markov>();
	private readonly kInternalMessageCache = new WeakMap<GuildTextBasedChannelTypes, Collection<string, Message>>();
	private readonly kInternalMessageCacheTTL = 120000;
	private readonly kInternalUserCache = new Map<string, Markov>();
	private readonly kInternalCacheTTL = 60000;
	private kBoundUseUpperCase!: (wordBank: WordBank) => string;
	private kProcess!: (message: GuildMessage, language: TFunction, markov: Markov) => Promise<MessageEmbed>;

	public async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName').catch(() => message.channel as GuildTextBasedChannelTypes);
		if (isNsfwChannel(channel) && !isNsfwChannel(message.channel)) {
			return this.error(LanguageKeys.Commands.Fun.MarkovNsfwChannel, { channel: channel.toString() });
		}
		const username = args.finished ? undefined : await args.pick('userName');

		// Send loading message
		await sendLoadingMessage(message, args.t);

		// Process the chain
		const embed = await this.kProcess(message, args.t, await this.retrieveMarkov(username, channel));
		return send(message, { embeds: [embed] });
	}

	public async onLoad() {
		this.kBoundUseUpperCase = this.useUpperCase.bind(this);
		this.kProcess = this.container.client.dev ? this.processDevelopment.bind(this) : this.processRelease.bind(this);
	}

	private async processRelease(message: GuildMessage, _: TFunction, markov: Markov) {
		return new MessageEmbed().setDescription(cutText(markov.process(), 2000)).setColor(await this.container.db.fetchColor(message));
	}

	private async processDevelopment(message: GuildMessage, t: TFunction, markov: Markov) {
		const time = new Stopwatch();
		const chain = markov.process();
		time.stop();

		return new MessageEmbed()
			.setDescription(cutText(chain, 2000))
			.setColor(await this.container.db.fetchColor(message))
			.setFooter({ text: t(LanguageKeys.Commands.Fun.MarkovTimer, { timer: time.toString() }) });
	}

	private async retrieveMarkov(user: User | undefined, channel: GuildTextBasedChannelTypes) {
		const entry = user ? this.kInternalUserCache.get(`${channel.id}.${user.id}`) : this.kInternalCache.get(channel);
		if (typeof entry !== 'undefined') return entry;

		const messageBank = await this.fetchMessages(channel, user);
		if (messageBank.size === 0) this.error(LanguageKeys.Commands.Fun.MarkovNoMessages);

		const contents = messageBank.map(getAllContent).join(' ');
		const markov = new Markov().parse(contents).start(this.kBoundUseUpperCase).end(60);
		if (user) this.kInternalUserCache.set(`${channel.id}.${user.id}`, markov);
		else this.kInternalCache.set(channel, markov);
		setTimeout(
			() => (user ? this.kInternalUserCache.delete(`${channel.id}.${user.id}`) : this.kInternalCache.delete(channel)),
			this.kInternalCacheTTL
		).unref();
		return markov;
	}

	private async fetchMessages(channel: GuildTextBasedChannelTypes, user: User | undefined) {
		let messageBank: Collection<string, Message>;

		// Check the cache first to speed up and reduce API queries
		const cachedMessageBank = this.kInternalMessageCache.get(channel);
		if (typeof cachedMessageBank === 'undefined') {
			messageBank = await channel.messages.fetch({ limit: 100 });
			for (let i = 1; i < this.kMessageHundredsLimit; ++i) {
				messageBank = messageBank.concat(await channel.messages.fetch({ limit: 100, before: messageBank.lastKey() }));
			}
			this.kInternalMessageCache.set(channel, messageBank);
			setTimeout(() => this.kInternalMessageCache.delete(channel), this.kInternalMessageCacheTTL).unref();
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
