import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('TWITCH_CLIENT_ID', 'TWITCH_TOKEN'),
	description: LanguageKeys.Commands.Twitch.FollowageDescription,
	extendedHelp: LanguageKeys.Commands.Twitch.FollowageExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const userName = await args.pick('string', { maximum: 20 });
		const channelName = await args.pick('string', { maximum: 20 });
		const { t } = args;

		// Get the User objects for the user and channel names
		const [user, channel] = await this.retrieveResults(userName, channelName);

		// Check if the user follows that channel
		const { data } = await this.container.client.twitch.fetchUserFollowage(user.id, channel.id);

		// If the user doesn't follow then the data length will be 0
		if (data.length === 0) this.error(LanguageKeys.Commands.Twitch.FollowageMissingEntries);

		// Otherwise we can parse the data
		const followingSince = new Date(data[0].followed_at).getTime();
		const followingFor = Date.now() - followingSince;

		const authorName = t(LanguageKeys.Commands.Twitch.Followage, {
			user: user.display_name,
			channel: channel.display_name,
			time: followingFor
		});
		const embed = new MessageEmbed()
			.setColor(this.container.client.twitch.BRANDING_COLOUR)
			.setAuthor(authorName, channel.profile_image_url)
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}

	private async retrieveResults(user: string, channel: string) {
		try {
			const { data } = await this.container.client.twitch.fetchUsers([], [user, channel]);
			if (!data || data.length < 2) this.error(LanguageKeys.Commands.Twitch.FollowageMissingEntries);

			return data;
		} catch {
			this.error(LanguageKeys.Commands.Twitch.FollowageMissingEntries);
		}
	}
}
