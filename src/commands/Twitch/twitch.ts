import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CdnUrls } from '@lib/types/Constants';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Twitch.TwitchDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Twitch.TwitchExtended),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<name:string>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [name]: [string]) {
		const { data: channelData } = await this.fetchUsers(message, [name]);
		if (channelData.length === 0) throw message.language.get(LanguageKeys.Commands.Twitch.TwitchNoEntries);
		const channel = channelData[0];

		const { total: followersTotal } = await this.client.twitch.fetchUserFollowage('', channel.id);

		const titles = message.language.get(LanguageKeys.Commands.Twitch.TwitchTitles);
		const affiliateStatus = this.parseAffiliateProgram(message, channel.broadcaster_type);

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
					affiliateStatus ? affiliateStatus : message.language.get(LanguageKeys.Commands.Twitch.TwitchPartnershipWithoutAffiliate)
				)
		);
	}

	private parseAffiliateProgram(message: KlasaMessage, type: 'affiliate' | 'partner' | '') {
		const options = message.language.get(LanguageKeys.Commands.Twitch.TwitchAffiliateStatus);
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
			throw message.language.get(LanguageKeys.Commands.Twitch.TwitchNoEntries);
		}
	}
}
