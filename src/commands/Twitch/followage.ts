import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Twitch.FollowageDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Twitch.FollowageExtended),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<user:string{1,20}> <channel:string{1,20}>',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [userName, channelName]: [string, string]) {
		// Get the User objects for the user and channel names
		const [user, channel] = await this.retrieveResults(message, userName, channelName);

		// Check if the user follows that channel
		const { data } = await this.client.twitch.fetchUserFollowage(user.id, channel.id);

		// If the user doesn't follow then the data length will be 0
		if (data.length === 0) throw message.language.get(LanguageKeys.Commands.Twitch.FollowageMissingEntries);

		// Otherwise we can parse the data
		const followingSince = new Date(data[0].followed_at).getTime();
		const followingFor = Date.now() - followingSince;

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(this.client.twitch.BRANDING_COLOUR)
				.setAuthor(
					message.language.get(LanguageKeys.Commands.Twitch.Followage, {
						user: user.display_name,
						channel: channel.display_name,
						time: followingFor
					}),
					channel.profile_image_url
				)
				.setTimestamp()
		);
	}

	private async retrieveResults(message: KlasaMessage, user: string, channel: string) {
		try {
			const { data } = await this.client.twitch.fetchUsers([], [user, channel]);
			if (!data || data.length < 2) throw message.language.get(LanguageKeys.Commands.Twitch.FollowageMissingEntries);

			return data;
		} catch (err) {
			throw message.language.get(LanguageKeys.Commands.Twitch.FollowageMissingEntries);
		}
	}
}
