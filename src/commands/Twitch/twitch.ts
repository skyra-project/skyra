import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CdnUrls } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	enabled: envIsDefined('TWITCH_CLIENT_ID', 'TWITCH_TOKEN'),
	description: LanguageKeys.Commands.Twitch.TwitchDescription,
	extendedHelp: LanguageKeys.Commands.Twitch.TwitchExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const name = await args.pick('string');
		const { t } = args;

		const { data: channelData } = await this.fetchUsers([name]);
		if (channelData.length === 0) this.error(LanguageKeys.Commands.Twitch.TwitchNoEntries);
		const channel = channelData[0];

		const { total: followersTotal } = await this.container.client.twitch.fetchUserFollowage('', channel.id);

		const titles = t(LanguageKeys.Commands.Twitch.TwitchTitles);
		const affiliateStatus = this.parseAffiliateProgram(t, channel.broadcaster_type);

		const embed = new MessageEmbed()
			.setColor(this.container.client.twitch.BRANDING_COLOUR)
			.setAuthor(channel.display_name, CdnUrls.TwitchLogo, `https://twitch.tv/${channel.login}`)
			.setTitle(titles.clickToVisit)
			.setURL(`https://twitch.tv/${channel.login}`)
			.setDescription(channel.description)
			.setThumbnail(channel.profile_image_url)
			.addField(titles.followers, formatNumber(t, followersTotal), true)
			.addField(titles.views, formatNumber(t, channel.view_count), true)
			.addField(titles.partner, affiliateStatus ? affiliateStatus : t(LanguageKeys.Commands.Twitch.TwitchPartnershipWithoutAffiliate));
		return send(message, { embeds: [embed] });
	}

	private parseAffiliateProgram(t: TFunction, type: 'affiliate' | 'partner' | '') {
		const options = t(LanguageKeys.Commands.Twitch.TwitchAffiliateStatus);
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

	private async fetchUsers(usernames: string[]) {
		try {
			return await this.container.client.twitch.fetchUsers([], usernames);
		} catch {
			this.error(LanguageKeys.Commands.Twitch.TwitchNoEntries);
		}
	}
}
