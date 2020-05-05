import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Colors } from '@lib/types/constants/Constants';
import { TwitchKrakenUserFollowersChannelResults } from '@lib/types/definitions/Twitch';
import { TOKENS } from '@root/config';
import { Mime } from '@utils/constants';
import { fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

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
			requiredPermissions: ['EMBED_LINKS'],
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
			.setColor(Number(followerData.channel.profile_banner_background_color) || Colors.DeepPurple)
			.setAuthor(message.language.tget('COMMAND_FOLLOWAGE', user.display_name, channel.display_name, followingFor), followerData.channel.logo));
	}

	private async retrieveResults(message: KlasaMessage, user: string, channel: string) {
		try {
			const results = await this.client.twitch.fetchUsersByLogin([user, channel]);
			if (!results || results._total < 2) throw message.language.tget('COMMAND_FOLLOWAGE_MISSING_ENTRIES');

			return results.users;
		} catch (err) {
			throw message.language.tget('COMMAND_FOLLOWAGE_MISSING_ENTRIES');
		}
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
