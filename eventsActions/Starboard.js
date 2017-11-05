const { MessageEmbed } = require('discord.js');

module.exports = class Starboard {

	constructor(client) {
		this.client = client;
		this.cache = new Map();
	}

	/*
        {
            userId: raw.user_id,
            user,
            channelId: data.channel_id,
            channel,
            emoji: {
                name: '⭐',
                id: null
            },
            messageId: raw.message_id
        };
    */
	async run(data) {
		if (this.client.ready !== true
			|| data.channel.type !== 'text'
			|| data.channel.nsfw === true
			|| data.emoji.name !== '⭐'
			|| data.channel.readable === false) return null;

		const settings = await data.channel.guild.settings;

		if (settings.starboard.channel === null
			|| (settings.starboard.ignoreChannels.length > 0 && settings.starboard.ignoreChannels.includes(data.channel.id))
			|| data.channel.id === settings.starboard.channel)
			return null;

		const starboard = data.channel.guild.channels.get(settings.starboard.channel);
		if (!starboard || starboard.postable === false)
			return settings.update({ starboard: { channel: null } })
				.catch(error => this.client.emit('log', error, 'wtf'));

		const i18n = this.client.languages.get(settings.master.language);
		const msg = await this.fetchMessage(data, settings, starboard);

		if (msg.author.id === data.user.id)
			return data.channel.postable === false ? null : data.channel.send(i18n.get('EVENTS_STARBOARD_SELF', data.user))
				.then(message => message.nuke(10000));
		if (data.user.bot)
			return data.channel.postable === false ? null : data.channel.send(i18n.get('EVENTS_STARBOARD_BOT', data.user))
				.then(message => message.nuke(10000));
		if (msg.content === '' && msg.attachments.size === 0)
			return data.channel.postable === false ? null : data.channel.send(i18n.get('EVENTS_STARBOARD_EMPTY', data.user))
				.then(message => message.nuke(10000));

		const star = this.getStar(msg);

		if (star.users.has(data.user.id))
			return null;

		const amount = star.users.add(data.user.id).size;

		if (star.message) {
			return star.message.edit(`${this.getStarIcon(amount)} **${amount}** ${data.channel} ID: ${msg.id}`, { embed: star.embed })
				.catch(error => this.client.emit('log', error, 'wtf'));
		}

		if (amount < settings.starboard.minimum)
			return null;

		return starboard.send(`${this.getStarIcon(amount)} **${amount}** ${msg.channel} ID: ${msg.id}`, { embed: star.embed })
			.then(message => { star.message = message; })
			.catch(error => this.client.emit('log', error, 'wtf'));
	}

	async fetchMessage(data, settings, channel) {
		const cache = this.cache.get(`${data.channel.id}-${data.messageId}`);
		if (cache) return cache.msg;
		const msg = await data.channel.messages.fetch(data.messageId);
		const reactions = msg.reactions.get('⭐');
		const users = await reactions.fetchUsers();

		const dataToSet = {
			msg,
			embed: this.createEmbed(msg),
			users: new Set(),
			message: null
		};

		for (const [id, user] of users) {
			if (data.user.id === user.id || user.bot === true || id === msg.author.id) continue;
			dataToSet.users.add(id);
		}

		if (dataToSet.users.size >= settings.starboard.minimum) {
			const messages = await channel.messages.fetch().catch(() => null);
			if (messages !== null) {
				const regexp = new RegExp(`(⭐|🌟|💫) \\*\\*\\d+\\*\\* <#${data.channel.id}> ID: ${msg.id}`);
				for (const message of messages.values()) {
					if (message.author.id !== this.client.user.id || regexp.test(message.content) === false) continue;
					dataToSet.message = message;
					break;
				}
			}
		}

		this.cache.set(`${msg.channel.id}-${msg.id}`, dataToSet);
		return msg;
	}

	getStar(msg) {
		return this.cache.get(`${msg.channel.id}-${msg.id}`) || this.createStar(msg);
	}

	getStarIcon(amount) {
		if (amount < 5) return '⭐';
		if (amount < 10) return '🌟';
		return '💫';
	}

	createStar(msg) {
		this.cache.set(`${msg.channel.id}-${msg.id}`, {
			msg,
			embed: this.createEmbed(msg),
			users: new Set(),
			message: null
		});

		return this.cache.get(`${msg.channel.id}-${msg.id}`);
	}

	createEmbed(msg) {
		const embed = new MessageEmbed()
			.setColor(15844367)
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setDescription(msg.content)
			.setFooter(`#${msg.channel.name} | ${msg.id}`)
			.setTimestamp(new Date(msg.createdTimestamp));

		const file = this.getFile(msg);
		if (file !== null)
			embed.setImage(file);

		return embed;
	}

	getFile(msg) {
		if (msg.attachments.size === 0) return null;
		const attachment = msg.attachments.first();
		return /\.(jpg|jpeg|png|gif)$/.test(attachment.url) ? attachment.url : null;
	}

};
