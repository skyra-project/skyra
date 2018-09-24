const { Structures } = require('discord.js');
const MemberSettings = require('../structures/MemberSettings');

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
			// @ts-ignore
			super(...args);

			/**
			 * The member level settings for this context
			 * @since 3.0.0
			 * @type {MemberSettings}
			 */
			this.settings = new MemberSettings(this);
		}

	}

	return SkyraGuildMember;
});
