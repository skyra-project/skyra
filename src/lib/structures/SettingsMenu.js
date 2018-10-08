const { Schema, MessageEmbed } = require('../../index');
const EMOJIS = { BACK: '◀', STOP: '⏹' };

class SettingsMenu {

	/** @param {SKYRA.SkyraMessage} message */
	constructor(message) {
		this.message = message;
		this.schema = message.client.gateways.guilds.schema;
		this.oldSettings = message.guild.settings.clone();
		this.reactionCollector = null;
		this.messageCollector = null;
		this.errorMessage = null;
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
		this.response.react(EMOJIS.STOP);
		this.reactionCollector = this.response.createReactionCollector((reaction, user) => user.id === this.message.author.id);
		this.reactionCollector.on('collect', (reaction, user) => this.onReaction(reaction, user));
		this.messageCollector = this.response.channel.createMessageCollector((msg) => msg.author.id === this.message.author.id);
		this.messageCollector.on('collect', (msg) => this.onMessage(msg));
		await this.response.edit(this.render());
	}

	render() {
		const description = [];
		if (this.pointerIsFolder) {
			description.push(`Currently at: 📁 ${this.schema.path || 'Root'}`);
			if (this.errorMessage) description.push(this.errorMessage);
			const keys = [], folders = [];
			for (const [key, value] of this.schema.entries()) {
				if (value.type === 'Folder') {
					if (value.configurableKeys.length) folders.push(key);
				} else if (value.configurable) {
					keys.push(key);
				}
			}

			if (!folders.length && !keys.length) description.push('There are no configurable keys for this folder');
			else description.push('Please select any of the following entries', ...folders.map(folder => `• \\📁${folder}`), '', ...keys.map(key => `• ${key}`));
		} else {
			description.push(`Currently at: ${this.schema.path}`);
			if (this.errorMessage) description.push('\n', this.errorMessage, '\n');
			if (this.schema.configurable) {
				description.push(
					'Some key metadata to fill later...',
					'\nText Commands:',
					'• Update Value → `set <value>`',
					this.schema.array ? '• Remove Value → `remove <value>`' : '',
					this.changedPieceValue ? '• Reset Value → `reset`' : '',
					this.changedCurrentPieceValue ? '• Undo Update → `undo`' : '',
					`\nCurrent Value: **\`\`${this.message.guild.settings.resolveString(this.message, this.schema).replace(/``+/g, '`\u200B`')}\`\`**`);
			}
		}

		const hasParent = Boolean(this.schema.parent);
		const hasReaction = this.response.reactions.has(EMOJIS.BACK);

		if (hasParent && !hasReaction) this.response.react(EMOJIS.BACK);
		else if (!hasParent && hasReaction) this.response.reactions.get(EMOJIS.BACK).users.remove(this.message.client.user.id);

		return this.embed
			.setDescription(`${description.filter(v => v).join('\n')}\n\u200B`)
			.setFooter(this.schema.parent ? 'Press ◀ to go back' : '')
			.setTimestamp();
	}

	/** @param {SKYRA.SkyraMessage} message */
	async onMessage(message) {
		this.errorMessage = null;
		if (this.pointerIsFolder) {
			const schema = this.schema.get(message.content);
			if (schema && schema.type === 'Folder' ? schema.configurableKeys.length : schema.configurable) this.schema = schema;
			else this.errorMessage = 'Invalid key';
		} else {
			const [command, ...params] = message.content.split(' ');
			const commandLowerCase = command.toLowerCase();
			if (commandLowerCase === 'set') await this.tryUpdate(params.join(' '), { action: 'set' });
			else if (commandLowerCase === 'remove') await this.tryUpdate(params.join(' '), { action: 'remove' });
			else if (commandLowerCase === 'reset') await this.tryUpdate(null);
			else if (commandLowerCase === 'undo') await this.tryUndo();
			else this.errorMessage = 'Invalid action';
		}

		if (this.errorMessage !== 'Invalid action') message.nuke();
		this.message.send(this.render());
	}

	/** @param {SKYRA.MessageReaction} reaction */
	async onReaction(reaction, user) {
		if (reaction.emoji.name === EMOJIS.STOP) {
			reaction.users.remove(user.id);
			this.stop();
			await this.response.edit('Successfully saved all changes.', { embed: null });
		} else if (reaction.emoji.name === EMOJIS.BACK) {
			reaction.users.remove(user.id);
			this.schema = this.schema.parent;
			await this.response.edit(this.render());
		}
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
		if (!this.reactionCollector.ended) this.reactionCollector.stop();
		if (!this.messageCollector.ended) this.messageCollector.stop();
	}

}

module.exports = SettingsMenu;
