const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { tokens: { WEEB_SH }, version } = require('../../../config');
const { fetch } = require('../util/util');

const DEFAULTS = [
	['requiredPermissions', ['EMBED_LINKS']],
	['bucket', 2],
	['cooldown', 30],
	['runIn', ['text']]
];
const hasKey = Object.prototype.hasOwnProperty;

class WeebCommand extends Command {

	constructor(client, store, file, core, { queryType, responseName, ...options }) {
		// Assign all redundant variables
		for (const [key, value] of DEFAULTS) if (!hasKey.call(options, key)) options[key] = value;

		super(client, store, file, core, options);

		/**
		 * The type for this command.
		 * @since 3.0.0
		 * @type {string}
		 */
		this.queryType = queryType;

		/**
		 * The response name for Language#get
		 * @since 3.0.0
		 * @type {string}
		 */
		this.responseName = responseName;

		/**
		 * Whether this command requires a user or not
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.requiresUser = Boolean(this.usage.parsedUsage.length);

		this.url = new URL('https://api-v2.weeb.sh/images/random');
		this.url.searchParams.append('type', this.queryType);
		this.url.searchParams.append('nsfw', 'false');
	}

	async run(msg, params) {
		const { url } = await fetch(this.url, {
			headers: {
				Authorization: `Wolke ${WEEB_SH}`,
				'User-Agent': `Skyra/${version}`
			}
		}, 'json');

		return msg.sendMessage(this.requiresUser
			? msg.language.get(this.responseName, params[0].username)
			: msg.language.get(this.responseName),
		{
			embed: new MessageEmbed()
				.setTitle('→').setURL(url)
				.setColor(msg.member.displayColor)
				.setImage(url)
				.setFooter(msg.language.get('POWEREDBY_WEEBSH'))
		});
	}

}

module.exports = WeebCommand;
