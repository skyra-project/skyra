const { Structures } = require('discord.js');
const MemberConfiguration = require('../structures/MemberConfiguration');

module.exports = Structures.extend('GuildMember', GuildMember => {
	/**
	 * Skyra's Extended GuildMember
	 * @extends {GuildMember}
	 */
	class SkyraGuildMember extends GuildMember {

		/**
		 * @param {...*} args Normal D.JS GuildMember args
		 */
		constructor(...args) {
			super(...args);

			/**
			 * The member level configs for this context
			 * @since 3.0.0
			 * @type {MemberConfiguration}
			 */
			this.configs = new MemberConfiguration(this);
		}

	}

	return SkyraGuildMember;
});
