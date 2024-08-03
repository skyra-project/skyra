import {
	getConfigurableGroups,
	isSchemaGroup,
	readSettings,
	remove,
	reset,
	SchemaGroup,
	SchemaKey,
	set,
	writeSettingsTransaction
} from '#lib/database/settings';
import { api } from '#lib/discord/Api';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraArgs, type SkyraCommand } from '#lib/structures';
import { Events, type GuildMessage } from '#lib/types';
import { floatPromise, minutes, stringifyError } from '#utils/common';
import { ZeroWidthSpace } from '#utils/constants';
import { deleteMessage } from '#utils/functions';
import { LongLivingReactionCollector, type LLRCData } from '#utils/LongLivingReactionCollector';
import { getColor, getFullEmbedAuthor, sendLoadingMessage } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { container, type MessageCommand } from '@sapphire/framework';
import { filter, partition } from '@sapphire/iterator-utilities';
import type { TFunction } from '@sapphire/plugin-i18next';
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
		this.schema = getConfigurableGroups();
		this.embed = new EmbedBuilder().setAuthor(getFullEmbedAuthor(this.message.author));
	}

	public get client() {
		return container.client;
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
		const description = isSchemaGroup(this.schema) ? this.renderGroup(this.schema) : await this.renderKey(this.schema);

		const { parent } = this.schema;
		if (parent) floatPromise(this._reactResponse(EMOJIS.BACK));
		else floatPromise(this._removeReactionFromUser(EMOJIS.BACK, this.client.id!));

		this.embed
			.setColor(getColor(this.message)) //
			.setDescription(description.concat(ZeroWidthSpace).join('\n'))
			.setTimestamp();

		// If there is a parent, show the back option:
		if (parent) {
			this.embed.setFooter({ text: this.t(LanguageKeys.Commands.Admin.ConfMenuRenderBack) });
		}

		return this.embed;
	}

	private async renderKey(entry: SchemaKey) {
		const settings = await readSettings(this.message.guild);

		this.t = getT(settings.language);
		const { t } = this;

		const description = [t(LanguageKeys.Commands.Admin.ConfMenuRenderAtPiece, { path: this.schema.name })];
		if (this.errorMessage) description.push('', this.errorMessage, '');
		description.push(t(entry.description), '', t(LanguageKeys.Commands.Admin.ConfMenuRenderUpdate));

		const value = settings[entry.property];

		// If the key is an array and has elements, show the remove option:
		if (entry.array && (value as unknown[]).length) {
			description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderRemove));
		}

		// If the value is different from the default value, show the reset option:
		if (value !== entry.default) {
			description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderReset));
		}

		// If there is undo data, show the undo option:
		if (this.updatedValue) {
			description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderUndo));
		}

		const serialized = entry.display(settings, this.t);
		description.push('', t(LanguageKeys.Commands.Admin.ConfMenuRenderCvalue, { value: serialized }));

		return description;
	}

	private renderGroup(entry: SchemaGroup) {
		const { t } = this;

		const description = [t(LanguageKeys.Commands.Admin.ConfMenuRenderAtFolder, { path: entry.name })];
		if (this.errorMessage) description.push(this.errorMessage);

		const [folders, keys] = partition(
			filter(entry.values(), (value) => !value.dashboardOnly),
			(value) => isSchemaGroup(value)
		);

		if (!folders.length && !keys.length) {
			description.push(t(LanguageKeys.Commands.Admin.ConfMenuRenderNokeys));
		} else {
			description.push(
				t(LanguageKeys.Commands.Admin.ConfMenuRenderSelect),
				'',
				...folders.map(({ key }) => `📁 ${key}`),
				...keys.map(({ key }) => `⚙️ ${key}`)
			);
		}

		return description;
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

			switch (args.next().toLowerCase()) {
				case 'set':
					await this.tryUpdate(UpdateType.Set, args);
					break;
				case 'remove':
					await this.tryUpdate(UpdateType.Remove, args);
					break;
				case 'reset':
					await this.tryUpdate(UpdateType.Reset);
					break;
				case 'undo':
					await this.tryUndo();
					break;
				default:
					this.errorMessage = this.t(LanguageKeys.Commands.Admin.ConfMenuInvalidAction);
			}
		}

		if (!this.errorMessage) {
			floatPromise(deleteMessage(message));
		}

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
			return await (userId === this.client.id
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
			this.client.emit(Events.Error, error as Error);
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
				this.client.emit(Events.Error, error as Error);
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
				this.client.emit(Events.Error, error as Error);
			}
		}
	}

	private async tryUpdate(action: UpdateType, args: SkyraArgs | null = null, value: unknown = null) {
		try {
			const key = this.schema as SchemaKey;
			using trx = await writeSettingsTransaction(this.message.guild);

			this.t = getT(trx.settings.language);
			this.oldValue = trx.settings[key.property];
			switch (action) {
				case UpdateType.Set: {
					trx.write(await set(trx.settings, key, args!));
					break;
				}
				case UpdateType.Remove: {
					trx.write(await remove(trx.settings, key, args!));
					break;
				}
				case UpdateType.Reset: {
					trx.write(reset(key));
					break;
				}
				case UpdateType.Replace: {
					trx.write({ [key.property]: value });
					break;
				}
			}
			await trx.submit();
		} catch (error) {
			this.errorMessage = stringifyError(this.t, error);
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
