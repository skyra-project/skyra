import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Twitch.FollowageDescription,
	extendedHelp: LanguageKeys.Commands.Twitch.FollowageExtended,
	permissions: ['EMBED_LINKS']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const userName = await args.pick('string', { maximum: 20 });
		const channelName = await args.pick('string', { maximum: 20 });
		const { t } = args;

		// Get the User objects for the user and channel names
		const [user, channel] = await this.retrieveResults(t, userName, channelName);

		// Check if the user follows that channel
		const { data } = await this.context.client.twitch.fetchUserFollowage(user.id, channel.id);

		// If the user doesn't follow then the data length will be 0
		if (data.length === 0) throw t(LanguageKeys.Commands.Twitch.FollowageMissingEntries);

		// Otherwise we can parse the data
		const followingSince = new Date(data[0].followed_at).getTime();
		const followingFor = Date.now() - followingSince;

		return message.send(
			new MessageEmbed()
				.setColor(this.context.client.twitch.BRANDING_COLOUR)
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
			const { data } = await this.context.client.twitch.fetchUsers([], [user, channel]);
			if (!data || data.length < 2) throw t(LanguageKeys.Commands.Twitch.FollowageMissingEntries);

			return data;
		} catch {
			throw t(LanguageKeys.Commands.Twitch.FollowageMissingEntries);
		}
	}
}
