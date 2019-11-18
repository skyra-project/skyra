import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { MessageEmbed } from 'discord.js';
import { fetch, FetchResultTypes } from '../../lib/util/util';
import { TOKENS } from '../../../config';
import { TwitchKrakenChannelResult } from '../../lib/types/definitions/Twitch';
import { Mime } from '../../lib/util/constants';

const kFetchOptions = {
	headers: {
		'Accept': Mime.Types.ApplicationTwitchV5Json,
		'Client-ID': TOKENS.TWITCH.CLIENT_ID
	}
} as const;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_TWITCH_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TWITCH_EXTENDED'),
			runIn: ['text'],
			usage: '<name:string>'
		});
	}

	public async run(message: KlasaMessage, [name]: [string]) {
		const results = await this.client.twitch.fetchUsersByLogin([name]);
		if (results._total === 0) throw message.language.tget('COMMAND_TWITCH_NO_ENTRIES');

		const channel = await fetch(`https://api.twitch.tv/kraken/channels/${results.users[0]._id}`, kFetchOptions, FetchResultTypes.JSON) as TwitchChannelResult;
		const titles = message.language.tget('COMMAND_TWITCH_TITLES');
		const embed = new MessageEmbed()
			.setColor(channel.profile_banner_background_color || 0x6441A6)
			.setAuthor(channel.display_name, 'https://i.imgur.com/OQwQ8z0.jpg', channel.url)
			.setThumbnail(channel.logo)
			.addField(titles.FOLLOWERS, channel.followers.toLocaleString(), true)
			.addField(titles.VIEWS, channel.views.toLocaleString(), true)
			.addField(titles.MATURE, message.language.tget('COMMAND_TWITCH_MATURITY', channel.mature))
			.addField(titles.PARTNER, message.language.tget('COMMAND_TWITCH_PARTNERSHIP', channel.partner), true)
			.setFooter(message.language.tget('COMMAND_TWITCH_CREATED_AT'))
			.setTimestamp(new Date(channel.created_at).getTime());

		if (channel.status) embed.setDescription(channel.status);
		return message.sendEmbed(embed);
	}

}
