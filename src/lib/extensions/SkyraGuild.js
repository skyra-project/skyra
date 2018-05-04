const { Structures } = require('discord.js');
const GuildSecurity = require('../util/GuildSecurity');
const StarboardManager = require('../structures/StarboardManager');

module.exports = Structures.extend('Guild', Guild => {
	/**
	 * Skyra's Extended Guild
	 * @extends {Guild}
	 */
	class SkyraGuild extends Guild {

		/**
		 * @param {...*} args Normal D.JS Guild args
		 */
		constructor(...args) {
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
		}

	}

	return SkyraGuild;
});
