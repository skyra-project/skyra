const { Structures, Collection } = require('discord.js');
const GuildSecurity = require('../util/GuildSecurity');
const StarboardManager = require('../structures/StarboardManager');
const ModerationManager = require('../structures/ModerationManager');

const kUnknownMember = Symbol('UnknownMember');

module.exports = Structures.extend('Guild', Guild => {
	/**
	 * Skyra's Extended Guild
	 * @extends {Guild}
	 */
	class SkyraGuild extends Guild {

		constructor(...args) {
			// @ts-ignore
			super(...args);

			/**
			 * The GuildSecurity class in charge of processing
			 * @since 3.0.0
			 * @type {GuildSecurity}
			 */
			this.security = new GuildSecurity(this);

			/**
			 * The StarboardManager instance in charge of managing the starred messages
			 * @since 3.0.0
			 * @type {StarboardManager}
			 */
			this.starboard = new StarboardManager(this);

			/**
			 * The ModerationManager instance in charge of managing moderation
			 * @since 3.4.0
			 * @type {ModerationManager}
			 */
			this.moderation = new ModerationManager(this);

			Object.defineProperty(this, 'memberSnowflakes', { writable: true });

			/**
			 * The name dictionary for this guild
			 * @since 4.0.0
			 * @type {Set<string>}
			 */
			this.memberSnowflakes = new Set();
		}

		get memberTags() {
			const collection = new Collection();
			for (const snowflake of this.memberSnowflakes) {
				// @ts-ignore
				const username = this.client.usernames.get(snowflake);
				if (username) collection.set(snowflake, username);
			}
			return collection;
		}

		get memberUsernames() {
			const collection = new Collection();
			for (const snowflake of this.memberSnowflakes) {
				// @ts-ignore
				const username = this.client.usernames.get(snowflake);
				if (username) collection.set(snowflake, username.slice(0, username.indexOf('#')));
			}
			return collection;
		}

	}

	return SkyraGuild;
});
