import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { MessageEmbed } from 'discord.js';
import { fetch } from '../../lib/util/util';
import { TOKENS } from '../../../config';

const kFetchOptions = {
	headers: {
		'Accept': 'application/vnd.twitchtv.v5+json',
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
		const results = await fetch(`https://api.twitch.tv/kraken/users?login=${encodeURIComponent(name).replace(/%20/g, '&20')}`, kFetchOptions, 'json') as TwitchResults;
		if (results._total === 0) throw message.language.tget('COMMAND_TWITCH_NO_ENTRIES');

		const channel = await fetch(`https://api.twitch.tv/kraken/channels/${results.users[0]._id}`, kFetchOptions, 'json') as TwitchChannelResult;
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


export interface TwitchResults {
	_total: number;
	users: TwitchResult[];
}

export interface TwitchResult {
	_id: string;
	bio: null | string;
	created_at: Date;
	display_name: string;
	logo: null | string;
	name: string;
	type: string;
	updated_at: Date;
}

export interface TwitchChannelResult {
	mature: boolean;
	status: string;
	broadcaster_language: string;
	broadcaster_software: string;
	display_name: string;
	game: string;
	language: string;
	_id: string;
	name: string;
	created_at: Date;
	updated_at: Date;
	partner: boolean;
	logo: string;
	video_banner: string;
	profile_banner: string;
	profile_banner_background_color: null;
	url: string;
	views: number;
	followers: number;
	broadcaster_type: string;
	description: string;
	private_video: boolean;
	privacy_options_enabled: boolean;
}
