const { Command } = require('klasa');
const { get } = require('snekfetch');
const { MessageEmbed } = require('discord.js');
const { tokens: { WEEB_SH } } = require('../../config');

const API = 'https://api-v2.weeb.sh';
const DEFAULTS = [
	['botPerms', ['EMBED_LINKS']],
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
	}

	async run(msg, params) {
		const { url } = await get(`${API}/images/random`)
			.set('Authorization', `Wolke ${WEEB_SH}`)
			.set('User-Agent', 'Skyra/3.0.0')
			.query('type', this.queryType)
			.query('nsfw', false)
			.then(result => JSON.parse(result.text));

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
