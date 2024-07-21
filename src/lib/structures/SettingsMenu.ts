import { configurableGroups, isSchemaGroup, readSettings, remove, SchemaGroup, SchemaKey, set, writeSettings } from '#lib/database/settings';
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraArgs, type SkyraCommand } from '#lib/structures';
import { Events, type GuildMessage } from '#lib/types';
import { floatPromise, minutes } from '#utils/common';
import { ZeroWidthSpace } from '#utils/constants';
import { deleteMessage } from '#utils/functions';
import { LongLivingReactionCollector, type LLRCData } from '#utils/LongLivingReactionCollector';
import { getColor, getFullEmbedAuthor, sendLoadingMessage } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { container, type MessageCommand } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { deepClone } from '@sapphire/utilities';
import { DiscordAPIError, MessageCollector, RESTJSONErrorCodes } from 'discord.js';

const EMOJIS = { BACK: '◀', STOP: '⏹' };
const TIMEOUT = minutes(15);

const enum UpdateType {
	Set,
	Remove,
	Reset,
	Replace
}

export class SettingsMenu {
	private readonly message: GuildMessage;
	private t: TFunction;
	private schema: SchemaKey | SchemaGroup;
	private messageCollector: MessageCollector | null = null;
	private errorMessage: string | null = null;
	private llrc: LongLivingReactionCollector | null = null;
	private readonly embed: EmbedBuilder;
	private response: GuildMessage | null = null;
	private oldValue: unknown = undefined;

	public constructor(message: GuildMessage, language: TFunction) {
		this.message = message;
		this.t = language;
		this.schema = configurableGroups;
		this.embed = new EmbedBuilder().setAuthor(getFullEmbedAuthor(this.message.author));
	}

	private get updatedValue(): boolean {
		return this.oldValue !== undefined;
	}

	public async init(context: SkyraCommand.RunContext): Promise<void> {
		this.response = await sendLoadingMessage(this.message, this.t);
		await this.response.react(EMOJIS.STOP);
		this.llrc = new LongLivingReactionCollector().setListener(this.onReaction.bind(this)).setEndListener(this.stop.bind(this));
		this.llrc.setTime(TIMEOUT);
		this.messageCollector = this.response.channel.createMessageCollector({
			filter: (msg) => msg.author!.id === this.message.author.id
		});
		this.messageCollector.on('collect', (msg) => this.onMessage(msg as GuildMessage, context));
		await this._renderResponse();
	}

	private async render() {
		const { t } = this;
		const description: string[] = [];
		if (isSchemaGroup(this.schema)) {
			description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderAtFolder, { path: this.schema.name }));
			if (this.errorMessage) description.push(this.errorMessage);
			const keys: string[] = [];
			const folders: string[] = [];
			for (const [key, value] of this.schema.entries()) {
				if (value.dashboardOnly) continue;
				if (isSchemaGroup(value)) folders.push(key);
				else keys.push(key);
			}

			if (!folders.length && !keys.length) description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderNokeys));
			else
				description.push(
					t(LanguageKeys.Commands.Admin.ConfMenuRenderSelect),
					'',
					...folders.map((folder) => `📁 ${folder}`),
					...keys.map((key) => `⚙️ ${key}`)
				);
		} else {
			description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderAtPiece, { path: this.schema.name }));
			if (this.errorMessage) description.push('\n', this.errorMessage, '\n');

			const settings = await readSettings(this.message.guild);

			this.t = settings.getLanguage();
			const value = settings[this.schema.property];
			const serialized = this.schema.display(settings, this.t);
			description.push(t(this.schema.description), '', t(LanguageKeys.Commands.Admin.ConfMenuRenderUpdate));
			if (this.schema.array && (value as unknown[]).length) description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderRemove));
			if (this.updatedValue) description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderReset));
			if (this.updatedValue) description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderUndo));
			description.push('', t(LanguageKeys.Commands.Admin.ConfMenuRenderCvalue, { value: serialized }));
		}

		const { parent } = this.schema;
		if (parent) floatPromise(this._reactResponse(EMOJIS.BACK));
		else floatPromise(this._removeReactionFromUser(EMOJIS.BACK, this.message.client.user!.id));

		this.embed
			.setColor(getColor(this.message))
			.setDescription(`${description.filter((v) => v !== null).join('\n')}\n${ZeroWidthSpace}`)
			.setTimestamp();

		if (parent) this.embed.setFooter({ text: t(LanguageKeys.Commands.Admin.ConfMenuRenderBack) });
		return this.embed;
	}

	private async onMessage(message: GuildMessage, context: SkyraCommand.RunContext) {
		// In case of messages that do not have a content, like attachments, ignore
		if (!message.content) return;

		this.llrc?.setTime(TIMEOUT);
		this.errorMessage = null;
		if (isSchemaGroup(this.schema)) {
			const schema = this.schema.get(message.content.toLowerCase());
			if (schema && !schema.dashboardOnly) {
				this.schema = schema as SchemaKey | SchemaGroup;
				this.oldValue = undefined;
			} else {
				this.errorMessage = this.t(LanguageKeys.Commands.Admin.ConfMenuInvalidKey);
			}
		} else {
			const conf = container.stores.get('commands').get('conf') as MessageCommand;
			const args = SkyraArgs.from(conf, message, message.content, context, this.t);

			const commandLowerCase = args.next().toLowerCase();
			if (commandLowerCase === 'set') await this.tryUpdate(UpdateType.Set, args);
			else if (commandLowerCase === 'remove') await this.tryUpdate(UpdateType.Remove, args);
			else if (commandLowerCase === 'reset') await this.tryUpdate(UpdateType.Reset);
			else if (commandLowerCase === 'undo') await this.tryUndo();
			else this.errorMessage = this.t(LanguageKeys.Commands.Admin.ConfMenuInvalidAction);
		}

		if (!this.errorMessage) floatPromise(deleteMessage(message));
		await this._renderResponse();
	}

	private async onReaction(reaction: LLRCData): Promise<void> {
		// If the message is not the menu's message, ignore:
		if (!this.response || reaction.messageId !== this.response.id) return;

		// If the user is not the author, ignore:
		if (reaction.userId !== this.message.author.id) return;

		this.llrc?.setTime(TIMEOUT);
		if (reaction.emoji.name === EMOJIS.STOP) {
			this.llrc?.end();
		} else if (reaction.emoji.name === EMOJIS.BACK) {
			floatPromise(this._removeReactionFromUser(EMOJIS.BACK, reaction.userId));
			if (this.schema.parent) {
				this.schema = this.schema.parent;
				this.oldValue = undefined;
			}
			await this._renderResponse();
		}
	}

	private async _removeReactionFromUser(reaction: string, userId: string) {
		if (!this.response) return;

		const channelId = this.response.channel.id;
		const messageId = this.response.id;
		try {
			return await (userId === this.message.client.user!.id
				? api().channels.deleteUserMessageReaction(channelId, messageId, reaction, userId)
				: api().channels.deleteOwnMessageReaction(channelId, messageId, reaction));
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === RESTJSONErrorCodes.UnknownMessage) {
					this.response = null;
					this.llrc?.end();
					return this;
				}

				if (error.code === RESTJSONErrorCodes.UnknownEmoji) {
					return this;
				}
			}

			// Log any other error
			this.message.client.emit(Events.Error, error as Error);
		}
	}

	private async _reactResponse(emoji: string) {
		if (!this.response) return;
		try {
			await this.response.react(emoji);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
				this.response = null;
				this.llrc?.end();
			} else {
				this.message.client.emit(Events.Error, error as Error);
			}
		}
	}

	private async _renderResponse() {
		if (!this.response) return;
		try {
			const embed = await this.render();
			await this.response.edit({ embeds: [embed] });
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
				this.response = null;
				this.llrc?.end();
			} else {
				this.message.client.emit(Events.Error, error as Error);
			}
		}
	}

	private async tryUpdate(action: UpdateType, args: SkyraArgs | null = null, value: unknown = null) {
		try {
			const key = this.schema as SchemaKey;
			const [oldValue, skipped] = await writeSettings(this.message.guild, async (settings) => {
				const oldValue = deepClone(settings[key.property]);

				switch (action) {
					case UpdateType.Set: {
						this.t = await set(settings, key, args!);
						break;
					}
					case UpdateType.Remove: {
						this.t = await remove(settings, key, args!);
						break;
					}
					case UpdateType.Reset: {
						Reflect.set(settings, key.property, key.default);
						this.t = settings.getLanguage();
						break;
					}
					case UpdateType.Replace: {
						Reflect.set(settings, key.property, value);
						this.t = settings.getLanguage();
						break;
					}
				}

				return [oldValue, false];
			});

			if (skipped) {
				this.errorMessage = this.t(LanguageKeys.Commands.Admin.ConfNochange, { key: key.name });
			} else {
				this.oldValue = oldValue;
			}
		} catch (error) {
			this.errorMessage = String(error);
		}
	}

	private async tryUndo() {
		if (this.updatedValue) {
			await this.tryUpdate(UpdateType.Replace, null, this.oldValue);
		} else {
			const key = this.schema as SchemaKey;
			this.errorMessage = this.t(LanguageKeys.Commands.Admin.ConfNochange, { key: key.name });
		}
	}

	private stop(): void {
		if (this.response) {
			if (this.response.reactions.cache.size) {
				floatPromise(this.response.reactions.removeAll());
			}

			const content = this.t(LanguageKeys.Commands.Admin.ConfMenuSaved);
			floatPromise(this.response.edit({ content, embeds: [] }));
		}

		if (!this.messageCollector!.ended) this.messageCollector!.stop();
	}
}
