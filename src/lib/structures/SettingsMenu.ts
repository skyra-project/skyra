import { configurableGroups, isSchemaGroup, remove, SchemaGroup, SchemaKey, set } from '@lib/database';
import { GuildMessage } from '@lib/types';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { deepClone } from '@sapphire/utilities';
import { BrandingColors, Time, ZeroWidthSpace } from '@utils/constants';
import { LLRCData, LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import { api } from '@utils/Models/Api';
import { floatPromise, pickRandom } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, MessageCollector, MessageEmbed } from 'discord.js';
import { Language } from 'klasa';
import { DbSet } from '../database/structures/DbSet';

const EMOJIS = { BACK: '◀', STOP: '⏹' };
const TIMEOUT = Time.Minute * 15;

const enum UpdateType {
	Set,
	Remove,
	Reset,
	Replace
}

export class SettingsMenu {
	private readonly message: GuildMessage;
	private language: Language;
	private schema: SchemaKey | SchemaGroup;
	private messageCollector: MessageCollector | null = null;
	private errorMessage: string | null = null;
	private llrc: LongLivingReactionCollector | null = null;
	private readonly embed: MessageEmbed;
	private response: GuildMessage | null = null;
	private oldValue: unknown = undefined;

	public constructor(message: GuildMessage, language: Language) {
		this.message = message;
		this.language = language;
		this.schema = configurableGroups;
		this.embed = new MessageEmbed().setAuthor(
			this.message.author.username,
			this.message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
		);
	}

	private get updatedValue(): boolean {
		return this.oldValue !== undefined;
	}

	public async init(): Promise<void> {
		this.response = (await this.message.sendEmbed(
			new MessageEmbed().setColor(BrandingColors.Secondary).setDescription(pickRandom(this.language.get(LanguageKeys.System.Loading)))
		)) as GuildMessage;
		await this.response.react(EMOJIS.STOP);
		this.llrc = new LongLivingReactionCollector(this.message.client).setListener(this.onReaction.bind(this)).setEndListener(this.stop.bind(this));
		this.llrc.setTime(TIMEOUT);
		this.messageCollector = this.response.channel.createMessageCollector((msg) => msg.author!.id === this.message.author.id);
		this.messageCollector.on('collect', (msg) => this.onMessage(msg));
		await this._renderResponse();
	}

	private async render() {
		const i18n = this.language;
		const description: string[] = [];
		if (isSchemaGroup(this.schema)) {
			description.push(i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderAtFolder, { path: this.schema.name }));
			if (this.errorMessage) description.push(this.errorMessage);
			const keys: string[] = [];
			const folders: string[] = [];
			for (const [key, value] of this.schema.entries()) {
				if (!value.dashboardOnly) {
					if (isSchemaGroup(value)) folders.push(key);
					else keys.push(key);
				}
			}

			if (!folders.length && !keys.length) description.push(i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderNokeys));
			else
				description.push(
					i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderSelect),
					'',
					...folders.map((folder) => `📁 ${folder}`),
					...keys.map((key) => `⚙️ ${key}`)
				);
		} else {
			description.push(i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderAtPiece, { path: this.schema.name }));
			if (this.errorMessage) description.push('\n', this.errorMessage, '\n');

			const [value, serialized, language] = await this.message.guild.readSettings((settings) => {
				const language = settings.getLanguage();
				const key = this.schema as SchemaKey;
				return [settings[key.property], key.display(settings, language), language];
			});
			this.language = language;
			description.push(
				i18n.get(this.schema.description),
				'',
				i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderTctitle),
				i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderUpdate),
				this.schema.array && (value as unknown[]).length ? i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderRemove) : '',
				this.updatedValue ? i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderReset) : '',
				this.updatedValue ? i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderUndo) : '',
				'',
				i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderCvalue, {
					value: serialized
				})
			);
		}

		const { parent } = this.schema;
		if (parent) floatPromise(this.message, this._reactResponse(EMOJIS.BACK));
		else floatPromise(this.message, this._removeReactionFromUser(EMOJIS.BACK, this.message.client.user!.id));

		return this.embed
			.setColor(await DbSet.fetchColor(this.message))
			.setDescription(`${description.filter((v) => v !== null).join('\n')}\n${ZeroWidthSpace}`)
			.setFooter(parent ? i18n.get(LanguageKeys.Commands.Admin.ConfMenuRenderBack) : '')
			.setTimestamp();
	}

	private async onMessage(message: GuildMessage) {
		// In case of messages that do not have a content, like attachments, ignore
		if (!message.content) return;

		this.llrc?.setTime(TIMEOUT);
		this.errorMessage = null;
		if (isSchemaGroup(this.schema)) {
			const schema = this.schema.get(message.content);
			if (schema) {
				this.schema = schema as SchemaKey | SchemaGroup;
				this.oldValue = undefined;
			} else {
				this.errorMessage = this.language.get(LanguageKeys.Commands.Admin.ConfMenuInvalidKey);
			}
		} else {
			const [command, ...params] = message.content.split(' ');
			const commandLowerCase = command.toLowerCase();
			if (commandLowerCase === 'set') await this.tryUpdate(params.join(' '), UpdateType.Set);
			else if (commandLowerCase === 'remove') await this.tryUpdate(params.join(' '), UpdateType.Remove);
			else if (commandLowerCase === 'reset') await this.tryUpdate(null, UpdateType.Reset);
			else if (commandLowerCase === 'undo') await this.tryUndo();
			else this.errorMessage = this.language.get(LanguageKeys.Commands.Admin.ConfMenuInvalidAction);
		}

		if (!this.errorMessage) floatPromise(this.message, message.nuke());
		await this._renderResponse();
	}

	private async onReaction(reaction: LLRCData): Promise<void> {
		if (reaction.userID !== this.message.author.id) return;
		this.llrc?.setTime(TIMEOUT);
		if (reaction.emoji.name === EMOJIS.STOP) {
			this.llrc?.end();
		} else if (reaction.emoji.name === EMOJIS.BACK) {
			floatPromise(this.message, this._removeReactionFromUser(EMOJIS.BACK, reaction.userID));
			if (this.schema.parent) {
				this.schema = this.schema.parent;
				this.oldValue = undefined;
			}
			await this._renderResponse();
		}
	}

	private async _removeReactionFromUser(reaction: string, userID: string) {
		if (!this.response) return;
		try {
			return await api(this.message.client)
				.channels(this.message.channel.id)
				.messages(this.response.id)
				.reactions(encodeURIComponent(reaction), userID === this.message.client.user!.id ? '@me' : userID)
				.delete();
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
			this.message.client.emit(Events.ApiError, error);
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
				this.message.client.emit(Events.ApiError, error);
			}
		}
	}

	private async _renderResponse() {
		if (!this.response) return;
		try {
			await this.response.edit(await this.render());
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
				this.response = null;
				this.llrc?.end();
			} else {
				this.message.client.emit(Events.ApiError, error);
			}
		}
	}

	private async tryUpdate(value: unknown, action: UpdateType) {
		try {
			const key = this.schema as SchemaKey;
			const [oldValue, skipped] = await this.message.guild.writeSettings(async (settings) => {
				const oldValue = deepClone(settings[key.property]);

				switch (action) {
					case UpdateType.Set: {
						this.language = await set(settings, key, value as string);
						break;
					}
					case UpdateType.Remove: {
						this.language = await remove(settings, key, value as string);
						break;
					}
					case UpdateType.Reset: {
						Reflect.set(settings, key.property, key.default);
						this.language = settings.getLanguage();
						break;
					}
					case UpdateType.Replace: {
						Reflect.set(settings, key.property, value);
						this.language = settings.getLanguage();
						break;
					}
				}

				return [oldValue, false];
			});

			if (skipped) {
				this.errorMessage = this.language.get(LanguageKeys.Commands.Admin.ConfNochange, { key: key.name });
			} else {
				this.oldValue = oldValue;
			}
		} catch (error) {
			this.errorMessage = String(error);
		}
	}

	private async tryUndo() {
		if (this.updatedValue) {
			await this.tryUpdate(this.oldValue, UpdateType.Replace);
		} else {
			const key = this.schema as SchemaKey;
			this.errorMessage = this.language.get(LanguageKeys.Commands.Admin.ConfNochange, { key: key.name });
		}
	}

	private stop(): void {
		if (this.response) {
			if (this.response.reactions.cache.size) {
				this.response.reactions.removeAll().catch((error) => this.response!.client.emit(Events.ApiError, error));
			}
			this.response
				.edit(this.language.get(LanguageKeys.Commands.Admin.ConfMenuSaved), { embed: null })
				.catch((error) => this.message.client.emit(Events.ApiError, error));
		}

		if (!this.messageCollector!.ended) this.messageCollector!.stop();
	}
}
