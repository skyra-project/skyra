import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors, Emojis } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { Timestamp } from '@sapphire/time-utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Invite, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['topinvs'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.TopInvitesDescription,
	extendedHelp: LanguageKeys.Commands.Tools.TopInvitesExtended,
	requiredGuildPermissions: ['MANAGE_GUILD']
})
export default class extends RichDisplayCommand {
	private inviteTimestamp = new Timestamp('YYYY/MM/DD HH:mm');

	public async run(message: GuildMessage) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const invites = await message.guild.fetchInvites();
		const topTen = invites
			.filter((invite) => invite.uses! > 0 && invite.inviter !== null)
			.sort((a, b) => b.uses! - a.uses!)
			.first(10) as NonNullableInvite[];

		if (topTen.length === 0) throw t(LanguageKeys.Commands.Tools.TopInvitesNoInvites);

		const display = await this.buildDisplay(message, t, topTen);

		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, invites: NonNullableInvite[]) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setTitle(t(LanguageKeys.Commands.Tools.TopInvitesTop10InvitesFor, { guild: message.guild }))
				.setColor(await DbSet.fetchColor(message))
		);
		const embedData = t(LanguageKeys.Commands.Tools.TopInvitesEmbedData, { returnObjects: true });

		for (const invite of invites) {
			display.addPage((embed: MessageEmbed) =>
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
					.addField(embedData.createdAt, this.resolveCreationDate(invite.createdTimestamp, embedData.createdAtUnknown), true)
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

	private resolveCreationDate(createdTimestamp: Invite['createdTimestamp'], fallback: string) {
		if (createdTimestamp !== null) return this.inviteTimestamp.display(createdTimestamp);
		return fallback;
	}
}

type NonNullableInvite = {
	[P in keyof Invite]: NonNullable<Invite[P]>;
};
