import { Events } from '@lib/types/Enums';
import { toTitleCase } from '@sapphire/utilities';
import { BrandingColors, Time, ZeroWidhSpace } from '@utils/constants';
import { LLRCData, LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import { api } from '@utils/Models/Api';
import { configurableSchemaKeys, displayEntry, isSchemaFolder } from '@utils/SettingsUtils';
import { floatPromise, pickRandom } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, MessageCollector, MessageEmbed } from 'discord.js';
import { KlasaMessage, Schema, SchemaEntry, SchemaFolder, Settings, SettingsFolderUpdateOptions } from 'klasa';
import { DbSet } from './DbSet';

const EMOJIS = { BACK: '◀', STOP: '⏹' };
const TIMEOUT = Time.Minute * 15;

export class SettingsMenu {
	private readonly message: KlasaMessage;
	private schema: Schema | SchemaEntry;
	private readonly oldSettings: Settings;
	private messageCollector: MessageCollector | null = null;
	private errorMessage: string | null = null;
	private llrc: LongLivingReactionCollector | null = null;
	private readonly embed: MessageEmbed;
	private response: KlasaMessage | null = null;

	public constructor(message: KlasaMessage) {
		this.message = message;
		this.schema = this.message.client.gateways.get('guilds')!.schema;
		this.oldSettings = this.message.guild!.settings.clone();
		this.embed = new MessageEmbed().setAuthor(
			this.message.author.username,
			this.message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
		);
	}

	private get changedCurrentPieceValue(): boolean {
		if (isSchemaFolder(this.schema)) return false;
		if (this.schema.array) {
			const current = this.message.guild!.settings.get(this.schema.path) as unknown[];
			const old = this.oldSettings.get(this.schema.path) as unknown[];
			return current.length !== old.length || current.some((value, i) => value !== old[i]);
		}
		// eslint-disable-next-line eqeqeq
		return this.message.guild!.settings.get(this.schema.path) != this.oldSettings.get(this.schema.path);
	}

	private get changedPieceValue(): boolean {
		if (isSchemaFolder(this.schema)) return false;
		// eslint-disable-next-line eqeqeq
		return this.message.guild!.settings.get(this.schema.path) != this.schema.default;
	}

	public async init(): Promise<void> {
		this.response = await this.message.sendEmbed(
			new MessageEmbed().setColor(BrandingColors.Secondary).setDescription(pickRandom(this.message.language.get('systemLoading')))
		);
		await this.response.react(EMOJIS.STOP);
		this.llrc = new LongLivingReactionCollector(this.message.client).setListener(this.onReaction.bind(this)).setEndListener(this.stop.bind(this));
		this.llrc.setTime(TIMEOUT);
		this.messageCollector = this.response.channel.createMessageCollector((msg) => msg.author!.id === this.message.author.id);
		this.messageCollector.on('collect', (msg) => this.onMessage(msg));
		await this._renderResponse();
	}

	private async render() {
		const i18n = this.message.language;
		const description: string[] = [];
		if (isSchemaFolder(this.schema)) {
			description.push(i18n.get('commandConfMenuRenderAtFolder', { path: this.schema.path || 'Root' }));
			if (this.errorMessage) description.push(this.errorMessage);
			const keys: string[] = [];
			const folders: string[] = [];
			for (const [key, value] of this.schema.entries()) {
				const entry = configurableSchemaKeys.get(value.path);
				if (typeof entry === 'undefined') continue;
				if (isSchemaFolder(entry)) folders.push(key);
				else keys.push(key);
			}

			if (!folders.length && !keys.length) description.push(i18n.get('commandConfMenuRenderNokeys'));
			else
				description.push(
					i18n.get('commandConfMenuRenderSelect'),
					'',
					...folders.map((folder) => `📁 ${folder}`),
					...keys.map((key) => `⚙️ ${key}`)
				);
		} else {
			description.push(i18n.get('commandConfMenuRenderAtPiece', { path: this.schema.path }));
			if (this.errorMessage) description.push('\n', this.errorMessage, '\n');
			if (this.schema.configurable) {
				description.push(
					i18n.get(`settings${this.schema.path.split(/[.-]/g).map(toTitleCase).join('')}` as any),
					'',
					i18n.get('commandConfMenuRenderTctitle'),
					i18n.get('commandConfMenuRenderUpdate'),
					this.schema.array && (this.message.guild!.settings.get(this.schema.path) as unknown[]).length
						? i18n.get('commandConfMenuRenderRemove')
						: '',
					this.changedPieceValue ? i18n.get('commandConfMenuRenderReset') : '',
					this.changedCurrentPieceValue ? i18n.get('commandConfMenuRenderUndo') : '',
					'',
					i18n.get('commandConfMenuRenderCvalue', {
						value: displayEntry(this.schema, this.message.guild!.settings.get(this.schema.path), this.message.guild!).replace(
							/``+/g,
							`\`${ZeroWidhSpace}\``
						)
					})
				);
			}
		}

		const { parent } = this.schema as SchemaEntry | SchemaFolder;

		if (parent) floatPromise(this.message, this._reactResponse(EMOJIS.BACK));
		else floatPromise(this.message, this._removeReactionFromUser(EMOJIS.BACK, this.message.client.user!.id));

		return this.embed
			.setColor(await DbSet.fetchColor(this.message))
			.setDescription(`${description.filter((v) => v !== null).join('\n')}\n${ZeroWidhSpace}`)
			.setFooter(parent ? i18n.get('commandConfMenuRenderBack') : '')
			.setTimestamp();
	}

	private async onMessage(message: KlasaMessage) {
		// In case of messages that do not have a content, like attachments, ignore
		if (!message.content) return;

		this.llrc?.setTime(TIMEOUT);
		this.errorMessage = null;
		if (isSchemaFolder(this.schema)) {
			const schema = this.schema.get(message.content);
			if (schema && configurableSchemaKeys.has(schema.path)) this.schema = schema;
			else this.errorMessage = this.message.language.get('commandConfMenuInvalidKey');
		} else {
			const [command, ...params] = message.content.split(' ');
			const commandLowerCase = command.toLowerCase();
			if (commandLowerCase === 'set') await this.tryUpdate(params.join(' '), { arrayAction: 'add' });
			else if (commandLowerCase === 'remove') await this.tryUpdate(params.join(' '), { arrayAction: 'remove' });
			else if (commandLowerCase === 'reset') await this.tryUpdate(null);
			else if (commandLowerCase === 'undo') await this.tryUndo();
			else this.errorMessage = this.message.language.get('commandConfMenuInvalidAction');
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
			if ((this.schema as SchemaFolder | SchemaEntry).parent) this.schema = (this.schema as SchemaFolder | SchemaEntry).parent;
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

	private async tryUpdate(value: unknown, options: SettingsFolderUpdateOptions = {}) {
		try {
			const updated = await (value === null
				? this.message.guild!.settings.reset(this.schema.path, { ...options, extraContext: { author: this.message.author.id } })
				: this.message.guild!.settings.update(this.schema.path, value, { ...options, extraContext: { author: this.message.author.id } }));
			if (updated.length === 0) this.errorMessage = this.message.language.get('commandConfNochange', { key: (this.schema as SchemaEntry).key });
		} catch (error) {
			this.errorMessage = String(error);
		}
	}

	private async tryUndo() {
		if (this.changedCurrentPieceValue) {
			const previousValue = this.oldSettings.get(this.schema.path);
			try {
				await (previousValue === null
					? this.message.guild!.settings.reset(this.schema.path, { extraContext: { author: this.message.author.id } })
					: this.message.guild!.settings.update(this.schema.path, previousValue, {
							arrayAction: 'overwrite',
							extraContext: { author: this.message.author.id }
					  }));
			} catch (error) {
				this.errorMessage = String(error);
			}
		} else {
			this.errorMessage = this.message.language.get('commandConfNochange', { key: (this.schema as SchemaEntry).key });
		}
	}

	private stop(): void {
		if (this.response) {
			if (this.response.reactions.cache.size) {
				this.response.reactions.removeAll().catch((error) => this.response!.client.emit(Events.ApiError, error));
			}
			this.response
				.edit(this.message.language.get('commandConfMenuSaved'), { embed: null })
				.catch((error) => this.message.client.emit(Events.ApiError, error));
		}
		if (!this.messageCollector!.ended) this.messageCollector!.stop();
	}
}
