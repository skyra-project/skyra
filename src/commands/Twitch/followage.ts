import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: language => language.tget('COMMAND_FOLLOWAGE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_FOLLOWAGE_EXTENDED'),
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
		if (data.length === 0) throw message.language.tget('COMMAND_FOLLOWAGE_NOT_FOLLOWING');

		// Otherwise we can parse the data
		const followingSince = new Date(data[0].followed_at).getTime();
		const followingFor = Date.now() - followingSince;

		return message.sendEmbed(new MessageEmbed()
			.setColor(this.client.twitch.brandingColour)
			.setAuthor(message.language.tget('COMMAND_FOLLOWAGE', user.display_name, channel.display_name, followingFor), channel.profile_image_url)
			.setTimestamp());
	}

	private async retrieveResults(message: KlasaMessage, user: string, channel: string) {
		try {
			const { data } = await this.client.twitch.fetchUsers([], [user, channel]);
			if (!data || data.length < 2) throw message.language.tget('COMMAND_FOLLOWAGE_MISSING_ENTRIES');

			return data;
		} catch (err) {
			throw message.language.tget('COMMAND_FOLLOWAGE_MISSING_ENTRIES');
		}
	}

}
