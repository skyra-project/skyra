const { MessageEmbed } = require('discord.js');
const { Timer } = require('../util');

const moment = require('moment');
const duration = time => moment.duration(time).format('h [hours,] m [minutes,] s [seconds]');

const COLOURS = {
	ban: { color: 0xD50000, title: 'Ban' },
	softban: { color: 0xFF1744, title: 'Softban' },
	kick: { color: 0xF57F17, title: 'Kick' },
	mute: { color: 0xF9A825, title: 'Mute' },
	vmute: { color: 0xFBC02D, title: 'Voice Mute' },
	warn: { color: 0xFFD600, title: 'Warn' },

	tban: { color: 0xC51162, title: 'Temporary Ban' },
	tmute: { color: 0xF50057, title: 'Temporary Mute' },
	tvmute: { color: 0xFF4081, title: 'Temporary Voice Mute' },

	unban: { color: 0x304FFE, title: 'Unban' },
	unmute: { color: 0x448AFF, title: 'Unmute' },
	vunmute: { color: 0xBBDEFB, title: 'Voice Unmute' },

	prune: { color: 0xB2FF59, title: 'Message Prune' }
};

class ModerationLog {

	constructor(guild) {
		this.client = guild.client;

		this.guild = guild;
		this.moderator = null;
		this.user = null;

		this.type = null;
		this.reason = null;
		this.extraData = null;

		this.duration = null;

		this.anonymous = false;
	}

	async retrieveModLog(id) {
		const log = await this.guild.settings.moderation.getCases(id);
		if (log.moderator) await this.client.users.fetch(log.moderator).then(user => this.setModerator(user));
		if (log.user) await this.client.users.fetch(log.user).then(user => this.setUser(user));
		this.type = log.type;
		this.reason = log.reason;

		const description = this.getDescription(id);

		let AUTO = false;
		let moderator;
		if (!this.moderator) {
			AUTO = true;
			moderator = this.client.user;
		} else {
			moderator = this.moderator.raw;
		}

		const embed = new MessageEmbed()
			.setColor(COLOURS[this.type].color)
			.setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128 }))
			.setDescription(description)
			.setFooter(`${AUTO ? 'AUTO | ' : ''}Case ${id}`)
			.setTimestamp();
		return embed;
	}

	setAnonymous(value) {
		this.anonymous = value;
		return this;
	}

	setModerator(user) {
		this.moderator = { id: user.id, tag: user.tag, raw: user };
		return this;
	}

	setUser(user) {
		this.user = { id: user.id, tag: user.tag, raw: user };
		return this;
	}

	setType(type) {
		this.type = type;
		return this;
	}

	setReason(reason) {
		if (reason === null) return this;
		if (Array.isArray(reason)) reason = reason.join(' ');
		this.reason = reason.length > 0 ? reason : null;

		if (['ban', 'mute', 'vmute'].includes(this.type)) return this.parseReason();
		return this;
	}

	parseReason() {
		if (this.reason === null) return this;

		const array = this.reason.includes('Time: ') ? this.reason.split('Time: ') : null;
		if (array === null) return this;

		const time = new Timer(array.pop().trim()).Duration;
		this.setDuration(time);
		this.reason = `${array.join('Time: ')}\n**AUTO**: This action will get reversed in: ${duration(time)}`;

		switch (this.type) {
			case 'ban': return this.setType('tban');
			case 'mute': return this.setType('tmute');
			case 'vmute': return this.setType('tvmute');
			// no default
		}

		return this;
	}

	setDuration(time) {
		this.duration = time;
		return this;
	}

	setExtraData(data) {
		this.extraData = data;
		return this;
	}

	/**
     * Send the modlog
     * @returns {number}
     * @memberof ModerationLog
     */
	async send() {
		if (this.anonymous) {
			if (this.user.raw.action === 'softban') {
				if (this.type === 'unban') delete this.user.raw.action;
				if (this.type !== 'softban') return null;
			} else
			if (this.user.raw.action === this.type) {
				delete this.user.raw.action;
				return null;
			}
		}

		const channel = this.getChannel();
		const { embed, numberCase } = await this.getMessage();

		if (channel) channel.send({ embed }).catch(err => this.client.emit('log', err, 'error'));

		const modcase = {
			moderator: this.moderator ? this.moderator.id : null,
			user: this.user ? this.user.id : null,
			type: this.type,
			case: numberCase,
			reason: this.reason,
			extraData: this.extraData
		};

		if (this.duration !== null) modcase.timed = true;

		await this.guild.settings.moderation.pushCase(modcase);

		if (this.duration !== null) {
			await this.client.handler.clock.create({
				type: this.appealType,
				timestamp: this.duration + Date.now(),
				user: this.user.id,
				guild: this.guild.id,
				duration: this.duration
			});
		}

		return numberCase;
	}

	get appealType() {
		switch (this.type) {
			case 'tban': return 'unban';
			case 'tmute': return 'unmute';
			case 'tvmute': return 'vunmute';
		}
		return this.type;
	}

	async getMessage() {
		const numberCase = await this.guild.settings.moderation.getAmountCases();
		const description = this.getDescription(numberCase);
		return { embed: this.getEmbed(description, numberCase), numberCase };
	}

	getEmbed(description, numberCase) {
		let AUTO = false;
		let moderator;
		if (!this.moderator) {
			AUTO = true;
			moderator = this.client.user;
		} else {
			moderator = this.moderator.raw;
		}
		const embed = new MessageEmbed()
			.setColor(COLOURS[this.type].color)
			.setAuthor(moderator.tag, moderator.displayAvatarURL({ size: 128 }))
			.setDescription(description)
			.setFooter(`${AUTO ? 'AUTO | ' : ''}Case ${numberCase}`, this.client.user.displayAvatarURL({ size: 128 }))
			.setTimestamp();
		return embed;
	}

	getDescription(numberCase) {
		return [
			`❯ **Action:** ${COLOURS[this.type].title}`,
			`❯ **User:** ${this.user.tag} (${this.user.id})`,
			`❯ **Reason:** ${this.reason || `Please use \`${this.guild.settings.master.prefix}reason ${numberCase} to claim.\``}`
		].join('\n');
	}

	getChannel() {
		return this.guild.settings.channels.modlog ? this.guild.channels.get(this.guild.settings.channels.modlog) : false;
	}

	static getColor(type) {
		return COLOURS[type];
	}

}

module.exports = ModerationLog;
