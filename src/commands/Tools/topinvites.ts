import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Emojis } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Invite, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['topinvs'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.TopInvitesDescription,
	extendedHelp: LanguageKeys.Commands.Tools.TopInvitesExtended,
	permissions: ['MANAGE_GUILD']
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const response = await sendLoadingMessage(message, args.t);

		const invites = await message.guild.fetchInvites();
		const topTen = invites
			.filter((invite) => invite.uses! > 0 && invite.inviter !== null)
			.sort((a, b) => b.uses! - a.uses!)
			.first(10) as NonNullableInvite[];

		if (topTen.length === 0) return this.error(args.t(LanguageKeys.Commands.Tools.TopInvitesNoInvites));

		const display = await this.buildDisplay(message, args.t, topTen);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, invites: NonNullableInvite[]) {
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setTitle(t(LanguageKeys.Commands.Tools.TopInvitesTop10InvitesFor, { guild: message.guild }))
				.setColor(await DbSet.fetchColor(message))
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
							`**${embedData.temporary}**: ${invite.temporary ? Emojis.GreenTick : Emojis.RedCross}`
						].join('\n')
					)
					.addField(embedData.createdAt, this.resolveCreationDate(t, invite.createdTimestamp, embedData.createdAtUnknown), true)
					.addField(embedData.expiresIn, this.resolveExpiryDate(t, invite.expiresTimestamp, embedData.neverExpress), true)
			);
		}

		return display;
	}

	private resolveUses(uses: Invite['uses'], maxUses: Invite['maxUses']) {
		if (maxUses !== null && maxUses > 0) return `${uses}/${maxUses}`;
		return uses;
	}

	private resolveExpiryDate(t: TFunction, expiresTimestamp: Invite['expiresTimestamp'], fallback: string) {
		if (expiresTimestamp !== null && expiresTimestamp > 0) return t(LanguageKeys.Globals.DurationValue, { value: expiresTimestamp - Date.now() });
		return fallback;
	}

	private resolveCreationDate(t: TFunction, createdTimestamp: Invite['createdTimestamp'], fallback: string) {
		if (createdTimestamp !== null) return t(LanguageKeys.Globals.DateTimeValue, { value: createdTimestamp });
		return fallback;
	}
}

type NonNullableInvite = {
	[P in keyof Invite]: NonNullable<Invite[P]>;
};
