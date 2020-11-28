import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { CdnUrls } from '#lib/types/Constants';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Twitch.TwitchDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Twitch.TwitchExtended),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<name:string>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [name]: [string]) {
		const language = await message.fetchLanguage();
		const { data: channelData } = await this.fetchUsers(language, [name]);
		if (channelData.length === 0) throw language.get(LanguageKeys.Commands.Twitch.TwitchNoEntries);
		const channel = channelData[0];

		const { total: followersTotal } = await this.client.twitch.fetchUserFollowage('', channel.id);

		const titles = language.get(LanguageKeys.Commands.Twitch.TwitchTitles);
		const affiliateStatus = this.parseAffiliateProgram(language, channel.broadcaster_type);

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(this.client.twitch.BRANDING_COLOUR)
				.setAuthor(channel.display_name, CdnUrls.TwitchLogo, `https://twitch.tv/${channel.login}`)
				.setTitle(titles.clickToVisit)
				.setURL(`https://twitch.tv/${channel.login}`)
				.setDescription(channel.description)
				.setThumbnail(channel.profile_image_url)
				.addField(titles.followers, language.groupDigits(followersTotal), true)
				.addField(titles.views, language.groupDigits(channel.view_count), true)
				.addField(
					titles.partner,
					affiliateStatus ? affiliateStatus : language.get(LanguageKeys.Commands.Twitch.TwitchPartnershipWithoutAffiliate)
				)
		);
	}

	private parseAffiliateProgram(language: Language, type: 'affiliate' | 'partner' | '') {
		const options = language.get(LanguageKeys.Commands.Twitch.TwitchAffiliateStatus);
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

	private async fetchUsers(language: Language, usernames: string[]) {
		try {
			return await this.client.twitch.fetchUsers([], usernames);
		} catch {
			throw language.get(LanguageKeys.Commands.Twitch.TwitchNoEntries);
		}
	}
}
