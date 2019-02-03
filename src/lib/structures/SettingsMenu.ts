import { MessageCollector, MessageEmbed } from 'discord.js';
import { KlasaMessage, Schema, SchemaEntry, SchemaFolder, SettingsFolderUpdateOptions } from 'klasa';
import { LLRCData, LongLivingReactionCollector } from '../util/LongLivingReactionCollector';

const EMOJIS = { BACK: '◀', STOP: '⏹' };

export class SettingsMenu {

	private readonly message: KlasaMessage;
	private schema: Schema | SchemaEntry = this.message.client.gateways.get('guilds').schema;
	private readonly oldSettings = this.message.guild.settings.clone();
	private messageCollector: MessageCollector;
	private errorMessage;
	private llrc: LongLivingReactionCollector;
	private readonly embed = new MessageEmbed()
		.setAuthor(this.message.author.username, this.message.author.displayAvatarURL({ size: 128 }))
		.setColor(this.message.member.displayColor);
	private response: KlasaMessage = null;

	public constructor(message: KlasaMessage) {
		this.message = message;
	}

	private get pointerIsFolder(): boolean {
		return this.schema instanceof Schema;
	}

	private get changedCurrentPieceValue(): boolean {
		if (this.schema.type === 'Folder') return false;
		const schema = this.schema as SchemaEntry;
		if (schema.array) {
			const current = this.message.guild.settings.get(this.schema.path) as any[];
			const old = this.oldSettings.get(this.schema.path) as any[];
			return current.length !== old.length || current.some((value, i) => value !== old[i]);
		}
		// tslint:disable-next-line:triple-equals
		return this.message.guild.settings.get(this.schema.path) != this.oldSettings.get(this.schema.path);
	}

	private get changedPieceValue(): boolean {
		if (this.schema.type === 'Folder') return false;
		const schema = this.schema as SchemaEntry;
		// tslint:disable-next-line:triple-equals
		return this.message.guild.settings.get(this.schema.path) != schema.default;
	}

	public async init(): Promise<void> {
		this.response = await this.message.send(this.message.language.get('SYSTEM_LOADING')) as KlasaMessage;
		await this.response.react(EMOJIS.STOP);
		this.llrc = new LongLivingReactionCollector(this.message.client)
			.setListener(this.onReaction.bind(this))
			.setEndListener(this.stop.bind(this));
		this.llrc.setTime(120000);
		this.messageCollector = this.response.channel.createMessageCollector((msg) => msg.author.id === this.message.author.id);
		this.messageCollector.on('collect', (msg) => this.onMessage(msg));
		await this.response.edit(this.render());
	}

	private render(): MessageEmbed {
		const i18n = this.message.language;
		const description = [];
		if (this.pointerIsFolder) {
			description.push(i18n.get('COMMAND_CONF_MENU_RENDER_AT_FOLDER', this.schema.path || 'Root'));
			if (this.errorMessage) description.push(this.errorMessage);
			const keys = [], folders = [];
			for (const [key, value] of (this.schema as Schema).entries()) {
				if (value.type === 'Folder') {
					if ((value as Schema).configurableKeys.length) folders.push(key);
				} else if ((value as SchemaEntry).configurable) {
					keys.push(key);
				}
			}

			if (!folders.length && !keys.length) description.push(i18n.get('COMMAND_CONF_MENU_RENDER_NOKEYS'));
			else description.push(i18n.get('COMMAND_CONF_MENU_RENDER_SELECT'), '', ...folders.map((folder) => `• \\📁${folder}`), ...keys.map((key) => `• ${key}`));
		} else {
			description.push(i18n.get('COMMAND_CONF_MENU_RENDER_AT_PIECE', this.schema.path));
			if (this.errorMessage) description.push('\n', this.errorMessage, '\n');
			if ((this.schema as SchemaEntry).configurable) {
				description.push(
					i18n.get(`SETTINGS_${this.schema.path.replace(/[.-]/g, '_').toUpperCase()}`),
					'',
					i18n.get('COMMAND_CONF_MENU_RENDER_TCTITLE'),
					i18n.get('COMMAND_CONF_MENU_RENDER_UPDATE'),
					(this.schema as SchemaEntry).array && (this.message.guild.settings.get(this.schema.path) as any[]).length ? i18n.get('COMMAND_CONF_MENU_RENDER_REMOVE') : null,
					this.changedPieceValue ? i18n.get('COMMAND_CONF_MENU_RENDER_RESET') : null,
					this.changedCurrentPieceValue ? i18n.get('COMMAND_CONF_MENU_RENDER_UNDO') : null,
					'',
					i18n.get('COMMAND_CONF_MENU_RENDER_CVALUE', this.message.guild.settings.display(this.message, this.schema).replace(/``+/g, '`\u200B`')));
			}
		}

		const parent = (this.schema as SchemaEntry | SchemaFolder).parent;

		if (parent) this.response.react(EMOJIS.BACK)
			.catch((error) => this.response.client.emit('apiError', error));
		else this._removeReactionFromUser(EMOJIS.BACK, this.message.client.user.id)
			.catch((error) => this.response.client.emit('apiError', error));

		return this.embed
			.setDescription(`${description.filter((v) => v !== null).join('\n')}\n\u200B`)
			.setFooter(parent ? i18n.get('COMMAND_CONF_MENU_RENDER_BACK') : '')
			.setTimestamp();
	}

	private async onMessage(message: KlasaMessage): Promise<void> {
		this.errorMessage = null;
		if (this.pointerIsFolder) {
			const schema = (this.schema as Schema).get(message.content);
			if (schema && (schema.type === 'Folder' ? (schema as Schema).configurableKeys.length : (schema as SchemaEntry).configurable)) this.schema = schema;
			else this.errorMessage = this.message.language.get('COMMAND_CONF_MENU_INVALID_KEY');
		} else {
			const [command, ...params] = message.content.split(' ');
			const commandLowerCase = command.toLowerCase();
			if (commandLowerCase === 'set') await this.tryUpdate(params.join(' '), { arrayAction: 'add' });
			else if (commandLowerCase === 'remove') await this.tryUpdate(params.join(' '), { arrayAction: 'remove' });
			else if (commandLowerCase === 'reset') await this.tryUpdate(null);
			else if (commandLowerCase === 'undo') await this.tryUndo();
			else this.errorMessage = this.message.language.get('COMMAND_CONF_MENU_INVALID_ACTION');
		}

		// tslint:disable-next-line:no-floating-promises
		if (!this.errorMessage) message.nuke();
		await this.message.send(this.render());
	}

	private async onReaction(reaction: LLRCData): Promise<void> {
		if (reaction.userID !== this.message.author.id) return;
		this.llrc.setTime(120000);
		if (reaction.emoji.name === EMOJIS.STOP) {
			this.llrc.end();
		} else if (reaction.emoji.name === EMOJIS.BACK) {
			this._removeReactionFromUser(EMOJIS.BACK, reaction.userID)
				.catch((error) => this.response.client.emit('apiError', error));
			this.schema = (this.schema as SchemaFolder | SchemaEntry).parent;
			await this.response.edit(this.render());
		}
	}

	private _removeReactionFromUser(reaction: string, userID: string): Promise<unknown> {
		// @ts-ignore
		return this.message.client.api.channels[this.message.channel.id].messages[this.response.id]
			.reactions(encodeURIComponent(reaction), userID === this.message.client.user.id ? '@me' : userID)
			.delete();
	}

	private async tryUpdate(value: any, options?: SettingsFolderUpdateOptions) {
		const { errors, updated } = await (value === null
			? this.message.guild.settings.reset(this.schema.path)
			: this.message.guild.settings.update(this.schema.path, value, options));
		if (errors.length) this.errorMessage = String(errors[0]);
		else if (!updated.length) this.errorMessage = this.message.language.get('COMMAND_CONF_NOCHANGE', (this.schema as SchemaEntry).key);
	}

	private async tryUndo() {
		if (!this.changedCurrentPieceValue) {
			this.errorMessage = this.message.language.get('COMMAND_CONF_NOCHANGE', (this.schema as SchemaEntry).key);
		} else {
			const previousValue = this.oldSettings.get(this.schema.path);
			const { errors } = await (previousValue === null
				? this.message.guild.settings.reset(this.schema.path)
				: this.message.guild.settings.update(this.schema.path, previousValue, { arrayAction: 'overwrite' }));
			if (errors.length) this.errorMessage = String(errors[0]);
		}
	}

	private stop(): void {
		if (this.response.reactions.size) this.response.reactions.removeAll()
			.catch((error) => this.response.client.emit('apiError', error));
		if (!this.messageCollector.ended) this.messageCollector.stop();
		this.response.edit(this.message.language.get('COMMAND_CONF_MENU_SAVED'), { embed: null })
			.catch((error) => this.message.client.emit('apiError', error));
	}

}
