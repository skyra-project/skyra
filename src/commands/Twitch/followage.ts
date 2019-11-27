import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { MessageEmbed } from 'discord.js';
import { fetch, FetchResultTypes } from '../../lib/util/util';
import { TOKENS } from '../../../config';
import { TwitchKrakenUserFollowersChannelResults } from '../../lib/types/definitions/Twitch';
import { Mime } from '../../lib/util/constants';

const kFetchOptions = {
	headers: {
		'Accept': Mime.Types.ApplicationTwitchV5Json,
		'Client-ID': TOKENS.TWITCH_CLIENT_ID
	}
} as const;

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_FOLLOWAGE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_FOLLOWAGE_EXTENDED'),
			runIn: ['text'],
			usage: '<user:string{1,20}> <channel:string{1,20}>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [userName, channelName]: [string, string]) {
		const [user, channel] = await this.retrieveResults(message, userName, channelName);
		const followerData = await this.retrieveFollowage(message, user._id, channel._id);
		const followingSince = new Date(followerData.created_at).getTime();
		const followingFor = Date.now() - followingSince;
		return message.sendEmbed(new MessageEmbed()
			.setColor(Number(followerData.channel.profile_banner_background_color) || 0x6441A6)
			.setAuthor(message.language.tget('COMMAND_FOLLOWAGE', user.display_name, channel.display_name, followingFor), followerData.channel.logo));
	}

	private async retrieveResults(message: KlasaMessage, user: string, channel: string) {
		const results = await this.client.twitch.fetchUsersByLogin([user, channel]);
		if (results._total < 2) throw message.language.tget('COMMAND_FOLLOWAGE_MISSING_ENTRIES');

		return results.users;
	}

	private async retrieveFollowage(message: KlasaMessage, userID: string, channelID: string) {
		try {
			return await fetch(`https://api.twitch.tv/kraken/users/${userID}/follows/channels/${channelID}`, kFetchOptions, FetchResultTypes.JSON) as TwitchKrakenUserFollowersChannelResults;
		} catch (error) {
			const parsed = JSON.parse(error.message) as { error: string; status: number; message: string };
			if (parsed.status === 404) throw message.language.tget('COMMAND_FOLLOWAGE_NOT_FOLLOWING');
			throw error;
		}
	}

}
