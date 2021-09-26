import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { secondsFromMilliseconds } from '#utils/common';
import { sendLoadingMessage } from '#utils/util';
import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { NonNullableProperties } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Invite, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['topinvs'],
	description: LanguageKeys.Commands.Tools.TopInvitesDescription,
	detailedDescription: LanguageKeys.Commands.Tools.TopInvitesExtended,
	requiredClientPermissions: [PermissionFlagsBits.ManageGuild]
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const response = await sendLoadingMessage(message, args.t);

		const invites = await message.guild.invites.fetch();
		const topTen = invites
			.filter((invite) => (invite.uses ?? 0) > 0 && invite.inviter !== null)
			.sort((a, b) => b.uses! - a.uses!)
			.first(10) as NonNullableInvite[];

		if (topTen.length === 0) this.error(LanguageKeys.Commands.Tools.TopInvitesNoInvites);

		const display = await this.buildDisplay(message, args.t, topTen);
		await display.run(response, message.author);
		return response;
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, invites: NonNullableInvite[]) {
		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setTitle(t(LanguageKeys.Commands.Tools.TopInvitesTop10InvitesFor, { guild: message.guild }))
				.setColor(await this.container.db.fetchColor(message))
		});
		const embedData = t(LanguageKeys.Commands.Tools.TopInvitesEmbedData);

		for (const invite of invites) {
			display.addPageEmbed((embed: MessageEmbed) =>
				embed
					.setAuthor(invite.inviter.tag, invite.inviter.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
					.setThumbnail(invite.inviter.displayAvatarURL({ size: 256, format: 'png', dynamic: true }))
					.setDescription(
						[
							`**${embedData.uses}**: ${this.resolveUses(invite.uses, invite.maxUses)}`,
							`**${embedData.link}**: [${invite.code}](${invite.url})`,
							`**${embedData.channel}**: ${invite.channel}`,
							`**${embedData.temporary}**: ${t(invite.temporary ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No)}`
						].join('\n')
					)
					.addField(embedData.createdAt, this.resolveCreationDate(invite.createdTimestamp, embedData.createdAtUnknown), true)
					.addField(embedData.expiresAt, this.resolveExpiryDate(invite.expiresTimestamp, embedData.neverExpress), true)
			);
		}

		return display;
	}

	private resolveUses(uses: Invite['uses'], maxUses: Invite['maxUses']) {
		if (maxUses !== null && maxUses > 0) return `${uses}/${maxUses}`;
		return uses;
	}

	private resolveExpiryDate(expiresTimestamp: Invite['expiresTimestamp'], fallback: string) {
		if (expiresTimestamp !== null && expiresTimestamp > 0) return time(secondsFromMilliseconds(expiresTimestamp), TimestampStyles.ShortDateTime);
		return fallback;
	}

	private resolveCreationDate(createdTimestamp: Invite['createdTimestamp'], fallback: string) {
		if (createdTimestamp !== null) return time(secondsFromMilliseconds(createdTimestamp), TimestampStyles.ShortDateTime);
		return fallback;
	}
}

type NonNullableInvite = NonNullableProperties<Invite>;
