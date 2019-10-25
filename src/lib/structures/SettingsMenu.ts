import { DiscordAPIError, MessageCollector, MessageEmbed } from 'discord.js';
import { KlasaMessage, Schema, SchemaEntry, SchemaFolder, Settings, SettingsFolderUpdateOptions } from 'klasa';
import { Events } from '../types/Enums';
import { LLRCData, LongLivingReactionCollector } from '../util/LongLivingReactionCollector';
import { getColor, floatPromise } from '../util/util';
import { api } from '../util/Models/Api';
import { TIME } from '../util/constants';

const EMOJIS = { BACK: '◀', STOP: '⏹' };
const TIMEOUT = TIME.MINUTE * 15;

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
		this.embed = new MessageEmbed()
			.setAuthor(this.message.author.username, this.message.author.displayAvatarURL({ size: 128 }))
			.setColor(getColor(this.message));
	}

	private get pointerIsFolder(): boolean {
		return this.schema.type === 'Folder';
	}

	private get changedCurrentPieceValue(): boolean {
		if (this.pointerIsFolder) return false;
		const schema = this.schema as SchemaEntry;
		if (schema.array) {
			const current = this.message.guild!.settings.get(this.schema.path) as unknown[];
			const old = this.oldSettings.get(this.schema.path) as unknown[];
			return current.length !== old.length || current.some((value, i) => value !== old[i]);
		}
		// eslint-disable-next-line eqeqeq
		return this.message.guild!.settings.get(this.schema.path) != this.oldSettings.get(this.schema.path);
	}

	private get changedPieceValue(): boolean {
		if (this.schema.type === 'Folder') return false;
		const schema = this.schema as SchemaEntry;
		// eslint-disable-next-line eqeqeq
		return this.message.guild!.settings.get(this.schema.path) != schema.default;
	}

	public async init(): Promise<void> {
		this.response = await this.message.send(this.message.language.tget('SYSTEM_LOADING'));
		await this.response.react(EMOJIS.STOP);
		this.llrc = new LongLivingReactionCollector(this.message.client)
			.setListener(this.onReaction.bind(this))
			.setEndListener(this.stop.bind(this));
		this.llrc.setTime(TIMEOUT);
		this.messageCollector = this.response.channel.createMessageCollector(msg => msg.author!.id === this.message.author.id);
		this.messageCollector.on('collect', msg => this.onMessage(msg));
		await this._renderResponse();
	}

	private render(): MessageEmbed {
		const i18n = this.message.language;
		const description: string[] = [];
		if (this.pointerIsFolder) {
			description.push(i18n.tget('COMMAND_CONF_MENU_RENDER_AT_FOLDER', this.schema.path || 'Root'));
			if (this.errorMessage) description.push(this.errorMessage);
			const keys: string[] = [];
			const folders: string[] = [];
			for (const [key, value] of (this.schema as Schema).entries()) {
				if (value.type === 'Folder') {
					if ((value as Schema).configurableKeys.length) folders.push(key);
				} else if ((value as SchemaEntry).configurable) {
					keys.push(key);
				}
			}

			if (!folders.length && !keys.length) description.push(i18n.tget('COMMAND_CONF_MENU_RENDER_NOKEYS'));
			else description.push(i18n.tget('COMMAND_CONF_MENU_RENDER_SELECT'), '', ...folders.map(folder => `• \\📁${folder}`), ...keys.map(key => `• ${key}`));
		} else {
			description.push(i18n.tget('COMMAND_CONF_MENU_RENDER_AT_PIECE', this.schema.path));
			if (this.errorMessage) description.push('\n', this.errorMessage, '\n');
			if ((this.schema as SchemaEntry).configurable) {
				description.push(
					i18n.get(`SETTINGS_${this.schema.path.replace(/[.-]/g, '_').toUpperCase()}`),
					'',
					i18n.tget('COMMAND_CONF_MENU_RENDER_TCTITLE'),
					i18n.tget('COMMAND_CONF_MENU_RENDER_UPDATE'),
					(this.schema as SchemaEntry).array && (this.message.guild!.settings.get(this.schema.path) as unknown[]).length ? i18n.tget('COMMAND_CONF_MENU_RENDER_REMOVE') : '',
					this.changedPieceValue ? i18n.tget('COMMAND_CONF_MENU_RENDER_RESET') : '',
					this.changedCurrentPieceValue ? i18n.tget('COMMAND_CONF_MENU_RENDER_UNDO') : '',
					'',
					i18n.tget('COMMAND_CONF_MENU_RENDER_CVALUE', this.message.guild!.settings.display(this.message, this.schema).replace(/``+/g, '`\u200B`'))
				);
			}
		}

		const { parent } = this.schema as SchemaEntry | SchemaFolder;

		if (parent) floatPromise(this.message, this._reactResponse(EMOJIS.BACK));
		else floatPromise(this.message, this._removeReactionFromUser(EMOJIS.BACK, this.message.client.user!.id));

		return this.embed
			.setDescription(`${description.filter(v => v !== null).join('\n')}\n\u200B`)
			.setFooter(parent ? i18n.tget('COMMAND_CONF_MENU_RENDER_BACK') : '')
			.setTimestamp();
	}

	private async onMessage(message: KlasaMessage) {
		// In case of messages that do not have a content, like attachments, ignore
		if (!message.content) return;

		this.llrc!.setTime(TIMEOUT);
		this.errorMessage = null;
		if (this.pointerIsFolder) {
			const schema = (this.schema as Schema).get(message.content);
			if (schema && this.isConfigurable(schema)) this.schema = schema;
			else this.errorMessage = this.message.language.tget('COMMAND_CONF_MENU_INVALID_KEY');
		} else {
			const [command, ...params] = message.content.split(' ');
			const commandLowerCase = command.toLowerCase();
			if (commandLowerCase === 'set') await this.tryUpdate(params.join(' '), { arrayAction: 'add' });
			else if (commandLowerCase === 'remove') await this.tryUpdate(params.join(' '), { arrayAction: 'remove' });
			else if (commandLowerCase === 'reset') await this.tryUpdate(null);
			else if (commandLowerCase === 'undo') await this.tryUndo();
			else this.errorMessage = this.message.language.tget('COMMAND_CONF_MENU_INVALID_ACTION');
		}

		if (!this.errorMessage) floatPromise(this.message, message.nuke());
		await this._renderResponse();
	}

	private async onReaction(reaction: LLRCData): Promise<void> {
		if (reaction.userID !== this.message.author.id) return;
		this.llrc!.setTime(TIMEOUT);
		if (reaction.emoji.name === EMOJIS.STOP) {
			this.llrc!.end();
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
				// Unknown Message
				if (error.code === 10008) {
					this.response = null;
					this.llrc!.end();
					return this;
				}

				// Unknown Emoji
				if (error.code === 10014) {
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
			// Unknown Message
			if (error instanceof DiscordAPIError && error.code === 10008) {
				this.response = null;
				this.llrc!.end();
			} else {
				this.message.client.emit(Events.ApiError, error);
			}
		}
	}

	private async _renderResponse() {
		if (!this.response) return;
		try {
			await this.response.edit(this.render());
		} catch (error) {
			// Unknown Message
			if (error instanceof DiscordAPIError && error.code === 10008) {
				this.response = null;
				this.llrc!.end();
			} else {
				this.message.client.emit(Events.ApiError, error);
			}
		}
	}

	private async tryUpdate(value: unknown, options?: SettingsFolderUpdateOptions) {
		const { errors, updated } = await (value === null
			? this.message.guild!.settings.reset(this.schema.path)
			: this.message.guild!.settings.update(this.schema.path, value, options));
		if (errors.length) this.errorMessage = String(errors[0]);
		else if (!updated.length) this.errorMessage = this.message.language.tget('COMMAND_CONF_NOCHANGE', (this.schema as SchemaEntry).key);
	}

	private async tryUndo() {
		if (this.changedCurrentPieceValue) {
			const previousValue = this.oldSettings.get(this.schema.path);
			const { errors } = await (previousValue === null
				? this.message.guild!.settings.reset(this.schema.path)
				: this.message.guild!.settings.update(this.schema.path, previousValue, { arrayAction: 'overwrite' }));
			if (errors.length) this.errorMessage = String(errors[0]);
		} else {
			this.errorMessage = this.message.language.tget('COMMAND_CONF_NOCHANGE', (this.schema as SchemaEntry).key);
		}
	}

	private stop(): void {
		if (this.response) {
			if (this.response.reactions.size) {
				this.response.reactions.removeAll()
					.catch(error => this.response!.client.emit(Events.ApiError, error));
			}
			this.response.edit(this.message.language.tget('COMMAND_CONF_MENU_SAVED'), { embed: null })
				.catch(error => this.message.client.emit(Events.ApiError, error));
		}
		if (!this.messageCollector!.ended) this.messageCollector!.stop();
	}

	private isConfigurable(schema: Schema | SchemaEntry) {
		return schema.type === 'Folder'
			? (schema as Schema).configurableKeys.length !== 0
			: (schema as SchemaEntry).configurable;
	}

}
