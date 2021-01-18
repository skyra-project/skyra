import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Twitch.FollowageDescription,
	extendedHelp: LanguageKeys.Commands.Twitch.FollowageExtended,
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<user:string{1,20}> <channel:string{1,20}>',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	public async run(message: Message, [userName, channelName]: [string, string]) {
		const t = await message.fetchT();
		// Get the User objects for the user and channel names
		const [user, channel] = await this.retrieveResults(t, userName, channelName);

		// Check if the user follows that channel
		const { data } = await this.client.twitch.fetchUserFollowage(user.id, channel.id);

		// If the user doesn't follow then the data length will be 0
		if (data.length === 0) throw t(LanguageKeys.Commands.Twitch.FollowageMissingEntries);

		// Otherwise we can parse the data
		const followingSince = new Date(data[0].followed_at).getTime();
		const followingFor = Date.now() - followingSince;

		return message.send(
			new MessageEmbed()
				.setColor(this.client.twitch.BRANDING_COLOUR)
				.setAuthor(
					t(LanguageKeys.Commands.Twitch.Followage, {
						user: user.display_name,
						channel: channel.display_name,
						time: followingFor
					}),
					channel.profile_image_url
				)
				.setTimestamp()
		);
	}

	private async retrieveResults(t: TFunction, user: string, channel: string) {
		try {
			const { data } = await this.client.twitch.fetchUsers([], [user, channel]);
			if (!data || data.length < 2) throw t(LanguageKeys.Commands.Twitch.FollowageMissingEntries);

			return data;
		} catch {
			throw t(LanguageKeys.Commands.Twitch.FollowageMissingEntries);
		}
	}
}
