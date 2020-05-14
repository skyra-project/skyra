import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: language => language.tget('COMMAND_TWITCH_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_TWITCH_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<name:string>'
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [name]: [string]) {
		const { data: channelData } = await this.client.twitch.fetchUsers([], [name]);
		if (channelData.length === 0) throw message.language.tget('COMMAND_TWITCH_NO_ENTRIES');
		const channel = channelData[0];

		const { total: followersTotal } = await this.client.twitch.fetchUserFollowage('', channel.id);

		const titles = message.language.tget('COMMAND_TWITCH_TITLES');

		return message.sendEmbed(new MessageEmbed()
			.setColor(this.client.twitch.BRANDING_COLOUR)
			.setAuthor(channel.display_name, 'https://cdn.skyra.pw/img/twitch/logo.png', `https://twitch.tv/${channel.login}`)
			.setTitle(titles.CLICK_TO_VISIT)
			.setURL(`https://twitch.tv/${channel.login}`)
			.setDescription(channel.description)
			.setThumbnail(channel.profile_image_url)
			.addField(titles.FOLLOWERS, message.language.groupDigits(followersTotal), true)
			.addField(titles.VIEWS, message.language.groupDigits(channel.view_count), true)
			.addField(
				titles.PARTNER,
				message.language.tget('COMMAND_TWITCH_PARTNERSHIP', this.parseAffiliateProgram(message, channel.broadcaster_type))
			));
	}

	private parseAffiliateProgram(message: KlasaMessage, type: 'affiliate' | 'partner' | '') {
		const options = message.language.tget('COMMAND_TWITCH_AFFILIATE_STATUS');
		switch (type) {
			case 'affiliate': return options.AFFILIATED;
			case 'partner': return options.PARTNERED;
			case '':
			default:
				return false;
		}
	}

}
