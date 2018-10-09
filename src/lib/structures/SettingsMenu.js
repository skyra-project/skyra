const { Schema } = require('klasa');
const { MessageEmbed } = require('discord.js');
const LongLivingReactionCollector = require('../util/LongLivingReactionCollector');
const EMOJIS = { BACK: '◀', STOP: '⏹' };

class SettingsMenu {

	/** @param {SKYRA.SkyraMessage} message */
	constructor(message) {
		this.message = message;
		this.schema = message.client.gateways.guilds.schema;
		this.oldSettings = message.guild.settings.clone();
		this.messageCollector = null;
		this.errorMessage = null;
		this.llrc = null;
		this.embed = new MessageEmbed()
			.setAuthor(message.author.username, message.author.displayAvatarURL({ size: 128 }))
			.setColor(this.message.member.displayColor);
		/** @type {SKYRA.SkyraMessage} */
		this.response = null;
	}

	get pointerIsFolder() {
		return this.schema instanceof Schema;
	}

	get changedCurrentPieceValue() {
		if (this.schema.type === 'Folder') return false;
		const current = this.message.guild.settings.get(this.schema.path);
		const old = this.oldSettings.get(this.schema.path);
		// eslint-disable-next-line eqeqeq
		return this.schema.array ? current.length !== old.length || current.some((value, i) => value !== old[i]) : current != old;
	}

	get changedPieceValue() {
		if (this.schema.type === 'Folder') return false;
		const current = this.message.guild.settings.get(this.schema.path);
		const defaultValue = this.schema.default;
		// eslint-disable-next-line eqeqeq
		return this.schema.array ? current.length !== defaultValue.length || current.some((value, i) => value !== defaultValue[i]) : current != defaultValue;
	}

	async init() {
		// @ts-ignore
		this.response = await this.message.send(this.message.language.get('SYSTEM_LOADING'));
		await this.response.react(EMOJIS.STOP);
		this.llrc = new LongLivingReactionCollector(this.message.client, this.onReaction.bind(this));
		this.llrc.setTime(120000);
		this.messageCollector = this.response.channel.createMessageCollector((msg) => msg.author.id === this.message.author.id);
		this.messageCollector.on('collect', (msg) => this.onMessage(msg));
		await this.response.edit(this.render());
	}

	render() {
		const i18n = this.message.language;
		const description = [];
		if (this.pointerIsFolder) {
			description.push(i18n.get('COMMAND_CONF_MENU_RENDER_AT_FOLDER', this.schema.path || 'Root'));
			if (this.errorMessage) description.push(this.errorMessage);
			const keys = [], folders = [];
			for (const [key, value] of this.schema.entries()) {
				if (value.type === 'Folder') {
					if (value.configurableKeys.length) folders.push(key);
				} else if (value.configurable) {
					keys.push(key);
				}
			}

			if (!folders.length && !keys.length) description.push(i18n.get('COMMAND_CONF_MENU_RENDER_NOKEYS'));
			else description.push(i18n.get('COMMAND_CONF_MENU_RENDER_SELECT'), '', ...folders.map(folder => `• \\📁${folder}`), ...keys.map(key => `• ${key}`));
		} else {
			description.push(i18n.get('COMMAND_CONF_MENU_RENDER_AT_PIECE', this.schema.path));
			if (this.errorMessage) description.push('\n', this.errorMessage, '\n');
			if (this.schema.configurable) {
				description.push(
					i18n.get(`SETTINGS_${this.schema.path.replace(/[.-]/g, '_').toUpperCase()}`),
					'',
					i18n.get('COMMAND_CONF_MENU_RENDER_TCTITLE'),
					i18n.get('COMMAND_CONF_MENU_RENDER_UPDATE'),
					this.schema.array && this.message.guild.settings.get(this.schema.path).length ? i18n.get('COMMAND_CONF_MENU_RENDER_REMOVE') : null,
					this.changedPieceValue ? i18n.get('COMMAND_CONF_MENU_RENDER_RESET') : null,
					this.changedCurrentPieceValue ? i18n.get('COMMAND_CONF_MENU_RENDER_UNDO') : null,
					'',
					i18n.get('COMMAND_CONF_MENU_RENDER_CVALUE', this.message.guild.settings.resolveString(this.message, this.schema).replace(/``+/g, '`\u200B`')));
			}
		}

		if (this.schema.parent) this.response.react(EMOJIS.BACK);
		else this._removeReactionFromUser(EMOJIS.BACK, this.message.client.user);

		return this.embed
			.setDescription(`${description.filter(v => v !== null).join('\n')}\n\u200B`)
			.setFooter(this.schema.parent ? i18n.get('COMMAND_CONF_MENU_RENDER_BACK') : '')
			.setTimestamp();
	}

	/** @param {SKYRA.SkyraMessage} message */
	async onMessage(message) {
		this.errorMessage = null;
		if (this.pointerIsFolder) {
			const schema = this.schema.get(message.content);
			if (schema && (schema.type === 'Folder' ? schema.configurableKeys.length : schema.configurable)) this.schema = schema;
			else this.errorMessage = this.message.language.get('COMMAND_CONF_MENU_INVALID_KEY');
		} else {
			const [command, ...params] = message.content.split(' ');
			const commandLowerCase = command.toLowerCase();
			if (commandLowerCase === 'set') await this.tryUpdate(params.join(' '), { action: 'add' });
			else if (commandLowerCase === 'remove') await this.tryUpdate(params.join(' '), { action: 'remove' });
			else if (commandLowerCase === 'reset') await this.tryUpdate(null);
			else if (commandLowerCase === 'undo') await this.tryUndo();
			else this.errorMessage = this.message.language.get('COMMAND_CONF_MENU_INVALID_ACTION');
		}

		if (!this.errorMessage) message.nuke();
		this.message.send(this.render());
	}

	/** @param {SKYRA.ReactionData} reaction */
	async onReaction(reaction, user) {
		if (user.id !== this.message.author.id) return;
		this.llrc.setTime(120000);
		if (reaction.emoji.name === EMOJIS.STOP) {
			this.stop();
			await this.response.edit(this.message.language.get('COMMAND_CONF_MENU_SAVED'), { embed: null });
		} else if (reaction.emoji.name === EMOJIS.BACK) {
			this._removeReactionFromUser(EMOJIS.BACK, user);
			this.schema = this.schema.parent;
			await this.response.edit(this.render());
		}
	}

	_removeReactionFromUser(reaction, user) {
		// @ts-ignore
		return this.message.client.api.channels[this.message.channel.id].messages[this.response.id]
			.reactions(encodeURIComponent(reaction), user.id === this.message.client.user.id ? '@me' : user.id)
			.delete();
	}

	async tryUpdate(value, options) {
		const { errors, updated } = await (value === null
			? this.message.guild.settings.reset(this.schema.path)
			: this.message.guild.settings.update(this.schema.path, value, this.message.guild, options));
		if (errors.length) this.errorMessage = String(errors[0]);
		else if (!updated.length) this.errorMessage = this.message.language.get('COMMAND_CONF_NOCHANGE', this.schema.key);
	}

	async tryUndo() {
		if (!this.changedCurrentPieceValue) {
			this.errorMessage = this.message.language.get('COMMAND_CONF_NOCHANGE', this.schema.key);
		} else {
			const previousValue = this.oldSettings.get(this.schema.path);
			const { errors } = await (previousValue === null
				? this.message.guild.settings.reset(this.schema.path)
				: this.message.guild.settings.update(this.schema.path, previousValue, { action: 'overwrite' }));
			if (errors.length) this.errorMessage = String(errors[0]);
		}
	}

	stop() {
		if (this.response.reactions.size) this.response.reactions.removeAll();
		if (!this.llrc.ended) this.llrc.end();
		if (!this.messageCollector.ended) this.messageCollector.stop();
	}

}

module.exports = SettingsMenu;
