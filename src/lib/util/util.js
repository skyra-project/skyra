const ModerationLog = require('./ModerationLog');
const { schemaKeys } = require('./Moderation');
const parseHTML = require('./parseHTML');
const { STATUS_CODES } = require('http');
const { get } = require('snekfetch');
const { DiscordAPIError } = require('discord.js');
const { util } = require('klasa');

/**
 * @typedef  {Object} UtilOneToTenEntry
 * @property {string} emoji
 * @property {number} color
 */

/**
 * The static Util class
 * @version 2.0.0
 */
class Util {

	// Check operations

	/**
	 * Check if the announcement is correctly set up
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message instance to check with
	 * @returns {Role}
	 */
	static announcementCheck(msg) {
		const announcementID = msg.guild.configs.roles.subscriber;
		if (!announcementID) throw msg.language.get('COMMAND_SUBSCRIBE_NO_ROLE');

		const role = msg.guild.roles.get(announcementID);
		if (!role) throw msg.language.get('COMMAND_SUBSCRIBE_NO_ROLE');

		if (role.position >= msg.guild.me.roles.highest.position) throw msg.language.get('SYSTEM_HIGHEST_ROLE');
		return role;
	}

	/**
	 * Check if a member is moderatable
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message instance to check with
	 * @param {GuildMember} moderator The moderator that triggered this check
	 * @param {GuildMember} target The member to check against
	 */
	static moderationCheck(msg, moderator, target) {
		if (target === msg.guild.me) throw msg.language.get('COMMAND_TOSKYRA');
		if (target === moderator) throw msg.language.get('COMMAND_USERSELF');
		if (target === msg.guild.owner) throw msg.language.get('COMMAND_ROLE_HIGHER_SKYRA');
		const { position } = target.roles.highest;
		if (position >= msg.guild.me.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER_SKYRA');
		if (position >= moderator.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
	}

	// Moderation

	/**
	 * Fetch a modlog with all its properties
	 * @since 3.0.0
	 * @param {KlasaGuild} guild The Guild instance that manages the modlog
	 * @param {number} caseID The case ID
	 * @returns {Promise<ModerationLog>}
	 */
	static async fetchModlog(guild, caseID) {
		const { client } = guild;
		const modlog = await client.moderation.getCase(guild.id, caseID);
		if (modlog) return Util.parseModlog(client, guild, modlog);
		return null;
	}
	/**
	 * Parse a modlog with all its properties
	 * @since 3.0.0
	 * @param {KlasaClient} client The Client that manages this process
	 * @param {KlasaGuild} guild The Guild instance that manages the modlog
	 * @param {Object} modlog The modlog object
	 * @returns {Promise<ModerationLog>}
	 */
	static async parseModlog(client, guild, modlog) {
		const [moderator, user] = await Promise.all([
			client.users.fetch(modlog[schemaKeys.MODERATOR]).catch(() => null),
			client.users.fetch(modlog[schemaKeys.USER]).catch(() => null)
		]);
		const log = new ModerationLog(guild)
			.setType(modlog[schemaKeys.TYPE])
			.setCaseNumber(modlog[schemaKeys.CASE])
			.setModerator(moderator)
			.setUser(user)
			.setReason(modlog[schemaKeys.REASON]);

		if (modlog[schemaKeys.DURATION]) log.setDuration(modlog[schemaKeys.DURATION]);
		if (modlog[schemaKeys.EXTRA_DATA]) log.setExtraData(modlog[schemaKeys.EXTRA_DATA]);

		return log;
	}

	// Error handler

	/**
	 * De-idiotify Discord.js Errors.
	 * @since 3.0.0
	 * @param {DiscordAPIError} error The error to de-idiotify
	 * @throws {DiscordAPIError}
	 */
	static deIdiotify(error) {
		if (error instanceof DiscordAPIError) Error.captureStackTrace(error);
		throw error;
	}

	// Misc utils

	/**
	 * Get an one-to-ten entry
	 * @since 3.0.0
	 * @param {number} level The number to check against
	 * @returns {UtilOneToTenEntry}
	 */
	static oneToTen(level) {
		if (level < 0) level = 0;
		else if (level > 10) level = 10;
		return Util.ONE_TO_TEN[level | 0];
	}

	/**
	 * Wrap a basic auth
	 * @since 3.0.0
	 * @param {string} user The username
	 * @param {string} pass The password
	 * @returns {string}
	 */
	static basicAuth(user, pass) {
		return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
	}

	/**
	 * Get a formatted status code
	 * @since 3.0.0
	 * @param {number} code The status code to check against
	 * @returns {string}
	 */
	static httpResponses(code) {
		return `[${code}] ${STATUS_CODES[code]}`;
	}

	/**
	 * Replace the residual HTML tags from the code.
	 * @since 3.0.0
	 * @param {string} text The text to parse
	 * @returns {string}
	 */
	static parseHTML(text) {
		return parseHTML(text);
	}

	/**
     * Split a string by its latest space character in a range from the character 0 to the selected one.
	 * @since 2.0.0
     * @param {string} str    The text to split.
     * @param {number} length The length of the desired string.
     * @returns {string}
     * @static
     */
	static splitText(str, length) {
		const x = str.substring(0, length).lastIndexOf(' ');
		const pos = x === -1 ? length : x;
		return str.substring(0, pos);
	}

	/**
	 * Fetch a user's avatar.
	 * @since 2.0.0
	 * @param {User} user The user.
	 * @param {(64|128|256|512|1024|2048)} size The size of the avatar to download.
	 * @returns {Promise<Buffer>}
	 */
	static fetchAvatar(user, size = 512) {
		const url = user.avatar ? user.avatarURL({ format: 'png', size }) : user.defaultAvatarURL;
		return get(url).then(data => data.body).catch((err) => { throw `Could not download the profile avatar: ${err}`; });
	}

	/**
	 * Get the content from a message.
	 * @since 3.0.0
	 * @param {KlasaMessage} message The Message to get the content from
	 * @returns {?string}
	 */
	static getContent(message) {
		if (message.content) return message.content;
		return (message.embeds.length && message.embeds[0].description) || null;
	}

	/**
	 * Get the first image from a message.
	 * @since 3.0.0
	 * @param {KlasaMessage} message The Message to get the image from
	 * @returns {?string}
	 */
	static getImage(message) {
		if (message.attachments.size) {
			const attachment = message.attachments.find(att => Util.IMAGE_EXTENSION.test(att.url));
			if (attachment) return attachment.url;
		}
		if (message.embeds.length) {
			const embed = message.embeds.find(emb => emb.type === 'image');
			if (embed) return embed.url;
		}
		return null;
	}

	// Mute role based utils

	/**
	 * Create the mute role
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message instance to use as context
	 * @returns {Role}
	 */
	static async createMuteRole(msg) {
		if (msg.guild.configs.roles.muted
			&& msg.guild.roles.has(msg.guild.configs.roles.muted)) throw new Error("There's already a muted role.");
		const role = await msg.guild.roles.create(Util.MUTE_ROLE_OPTIONS);
		const { channels } = msg.guild;
		await msg.sendMessage(`Applying permissions (\`SEND_MESSAGES\`:\`false\`) for ${channels.size} to ${role}...`);
		const denied = [];
		let accepted = 0;

		for (const channel of channels.values()) { // eslint-disable-line no-restricted-syntax
			await Util._createMuteRolePush(channel, role, denied);
			accepted++;
		}

		const messageEdit2 = denied.length > 1 ? `, with exception of ${denied.join(', ')}.` : '. ';
		await util.sleep(1500);
		await msg.guild.configs.update('roles.muted', role.id, msg.guild);
		await msg.sendMessage(`Permissions applied for ${accepted} channels${messageEdit2}Dear ${msg.author}, don't forget to tweak the permissions in the channels you want ${role} to send messages.`);
		return role;
	}

	/**
	 * Push the permissions for the muted role into a channel
	 * @since 3.0.0
	 * @param {Channel} channel The channel to modify
	 * @param {Role} role The role to update
	 * @param {string[]} array The array to push in case it did fail
	 * @returns {Promise<*>}
	 * @private
	 */
	static async _createMuteRolePush(channel, role, array) {
		if (channel.type === 'category') return null;
		return channel.updateOverwrite(role, Util.MUTE_ROLE_PERMISSIONS[channel.type])
			.catch(() => array.push(String(channel)));
	}

}

Util.xml2js = require('util').promisify(require('xml2js').parseString);

Util.MUTE_ROLE_PERMISSIONS = Object.freeze({
	text: { SEND_MESSAGES: false, ADD_REACTIONS: false },
	voice: { CONNECT: false }
});

Util.MUTE_ROLE_OPTIONS = Object.freeze({
	reason: '[SETUP] Authorized to create a \'Muted\' role.',
	data: {
		name: 'Muted',
		color: 0x422c0b,
		hoist: false,
		permissions: [],
		mentionable: false
	}
});

Util.ONE_TO_TEN = Object.freeze({
	0: { emoji: '😪', color: 0x5B1100 },
	1: { emoji: '😪', color: 0x5B1100 },
	2: { emoji: '😫', color: 0xAB1100 },
	3: { emoji: '😔', color: 0xFF2B00 },
	4: { emoji: '😒', color: 0xFF6100 },
	5: { emoji: '😌', color: 0xFF9C00 },
	6: { emoji: '😕', color: 0xB4BF00 },
	7: { emoji: '😬', color: 0x84FC00 },
	8: { emoji: '🙂', color: 0x5BF700 },
	9: { emoji: '😃', color: 0x24F700 },
	10: { emoji: '😍', color: 0x51D4EF }
});

Util.IMAGE_EXTENSION = /(\.bmp|\.jpg|\.jpeg|\.png|\.gif|\.webp)$/i;

module.exports = Util;
