const { STATUS_CODES } = require('http');
const parseHTML = require('./parseHTML');
const snekie = require('snekfetch');

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

		if (role.position >= msg.guild.me.highestRole.position) throw msg.language.get('SYSTEM_HIGHEST_ROLE');
		return role;
	}

	/**
	 * Check if a user is moderatable
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message instance to check with
	 * @param {KlasaUser} moderator The moderator that triggered this check
	 * @param {KlasaUser} target The user to check against
	 */
	static moderationCheck(msg, moderator, target) {
		if (target.id === msg.guild.ownerID) throw msg.language.get('COMMAND_ROLE_HIGHER');
		if (target.id === moderator.id) throw msg.language.get('COMMAND_USERSELF');
		if (target.id === msg.client.user.id) throw msg.language.get('COMMAND_TOSKYRA');
		const targetHighestRole = target.highestRole.position;
		if (targetHighestRole >= moderator.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
		if (targetHighestRole >= msg.guild.me.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER_SKYRA');
	}

	// Misc utils

	/**
	 * Get an one-to-ten entry
	 * @since 3.0.0
	 * @param {number} level The number to check against
	 * @returns {UtilOneToTenEntry}
	 */
	static oneToTen(level) {
		return Util.ONE_TO_TEN[level];
	}

	/**
	 * Wrap a basic auth
	 * @since 3.0.0
	 * @param {string} user The username
	 * @param {string} pass The password
	 * @returns {string}
	 */
	static basicAuth(user, pass) {
		return `Basic ${new Buffer(`${user}:${pass}`).toString('base64')}`;
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
	 * @param {User} user The user.
	 * @param {(64|128|256|512|1024|2048)} size The size of the avatar to download.
	 * @returns {Promise<Buffer>}
	 */
	static fetchAvatar(user, size = 512) {
		const url = user.avatar ? user.avatarURL({ format: 'png', size }) : user.defaultAvatarURL;
		return snekie.get(url).then(data => data.body).catch((err) => { throw `Could not download the profile avatar: ${err}`; });
	}

	// Mute role based utils

	/**
	 * Create the mute role
	 * @since 3.0.0
	 * @param {KlasaMessage} msg The message instance to use as context
	 * @returns {Role}
	 */
	static async createMuteRole(msg) {
		if (msg.guild.configs.roles.muted) throw new Error("There's already a muted role.");
		const role = await msg.guild.createRole(Util.MUTE_ROLE_OPTIONS);
		const channels = msg.guild.channels;
		await msg.send(`Applying permissions (\`SEND_MESSAGES\`:\`false\`) for ${channels.size} to ${role}...`);
		const denied = [];
		let accepted = 0;

		for (const channel of channels.values()) { // eslint-disable-line no-restricted-syntax
			await Util._createMuteRolePush(channel, role, denied);
			accepted += 1;
		}

		const messageEdit2 = denied.length > 1 ? `, with exception of ${denied.join(', ')}.` : '. ';
		await msg.guild.configs.update('roles.muted', role.id);
		await msg.send(`Permissions applied for ${accepted} channels${messageEdit2}Dear ${msg.author}, don't forget to tweak the permissions in the channels you want ${role} to send messages.`);
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
		return channel.overwritePermissions(role, Util.MUTE_ROLE_PERMISSIONS[channel.type])
			.catch(() => array.push(String(channel)));
	}

}

Util.xml2js = require('util').promisify(require('xml2js').parseString);

Util.MUTE_ROLE_PERMISSIONS = Object.freeze({
	text: { SEND_MESSAGES: false },
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

module.exports = Util;
