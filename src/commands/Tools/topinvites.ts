import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, Emojis } from '@utils/constants';
import { Invite, MessageEmbed } from 'discord.js';
import { KlasaMessage, Timestamp } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['topinvs'],
	cooldown: 10,
	description: (language) => language.get('commandTopInvitesDescription'),
	extendedHelp: (language) => language.get('commandTopInvitesExtended'),
	requiredGuildPermissions: ['MANAGE_GUILD'],
	runIn: ['text']
})
export default class extends RichDisplayCommand {
	private inviteTimestamp = new Timestamp('YYYY/MM/DD HH:mm');

	public async run(message: KlasaMessage) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(message.language.get('systemLoading')).setColor(BrandingColors.Secondary)
		);

		const invites = await message.guild!.fetchInvites();
		const topTen = invites
			.filter((invite) => invite.uses! > 0 && invite.inviter !== null)
			.sort((a, b) => b.uses! - a.uses!)
			.first(10) as NonNullableInvite[];

		if (topTen.length === 0) throw message.language.get('commandTopInvitesNoInvites');

		const display = await this.buildDisplay(message, topTen);

		await display.start(response, message.author.id);
		return response;
	}

	private async buildDisplay(message: KlasaMessage, invites: NonNullableInvite[]) {
		const display = new UserRichDisplay(
			new MessageEmbed()
				.setTitle(message.language.get('commandTopInvitesTop10InvitesFor', { guild: message.guild! }))
				.setColor(await DbSet.fetchColor(message))
		);
		const embedData = message.language.get('commandTopInvitesEmbedData');

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
					.addField(embedData.expiresIn, this.resolveExpiryDate(message, invite.expiresTimestamp, embedData.neverExpress), true)
			);
		}

		return display;
	}

	private resolveUses(uses: Invite['uses'], maxUses: Invite['maxUses']) {
		if (maxUses !== null && maxUses > 0) return `${uses}/${maxUses}`;
		return uses;
	}

	private resolveExpiryDate(message: KlasaMessage, expiresTimestamp: Invite['expiresTimestamp'], fallback: string) {
		if (expiresTimestamp !== null && expiresTimestamp > 0) return message.language.duration(expiresTimestamp - Date.now(), 2);
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
