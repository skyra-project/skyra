import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { CdnUrls } from '@lib/types/Constants';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: (language) => language.get('commandTwitchDescription'),
	extendedHelp: (language) => language.get('commandTwitchExtended'),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<name:string>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [name]: [string]) {
		const { data: channelData } = await this.fetchUsers(message, [name]);
		if (channelData.length === 0) throw message.language.get('commandTwitchNoEntries');
		const channel = channelData[0];

		const { total: followersTotal } = await this.client.twitch.fetchUserFollowage('', channel.id);

		const titles = message.language.get('commandTwitchTitles');

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(this.client.twitch.BRANDING_COLOUR)
				.setAuthor(channel.display_name, CdnUrls.TwitchLogo, `https://twitch.tv/${channel.login}`)
				.setTitle(titles.clickToVisit)
				.setURL(`https://twitch.tv/${channel.login}`)
				.setDescription(channel.description)
				.setThumbnail(channel.profile_image_url)
				.addField(titles.followers, message.language.groupDigits(followersTotal), true)
				.addField(titles.views, message.language.groupDigits(channel.view_count), true)
				.addField(
					titles.partner,
					message.language.get('commandTwitchPartnership', {
						affiliateStatus: this.parseAffiliateProgram(message, channel.broadcaster_type)
					})
				)
		);
	}

	private parseAffiliateProgram(message: KlasaMessage, type: 'affiliate' | 'partner' | '') {
		const options = message.language.get('commandTwitchAffiliateStatus');
		switch (type) {
			case 'affiliate':
				return options.affiliated;
			case 'partner':
				return options.partnered;
			case '':
			default:
				return false;
		}
	}

	private async fetchUsers(message: KlasaMessage, usernames: string[]) {
		try {
			return await this.client.twitch.fetchUsers([], usernames);
		} catch {
			throw message.language.get('commandTwitchNoEntries');
		}
	}
}
