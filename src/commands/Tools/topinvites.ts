import { Invite, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { BrandingColors, Emojis } from '../../lib/util/constants';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	private inviteTimestamp = new Timestamp('YYYY/MM/DD HH:mm');
	private filter: (invite: Invite) => boolean;

	public constructor(store: CommandStore, file: string[], directory: string) {

		super(store, file, directory, {
			aliases: ['topinvs'],
			cooldown: 10,
			description: language => language.tget('COMMAND_TOPINVITES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TOPINVITES_EXTENDED'),
			requiredGuildPermissions: ['MANAGE_GUILD'],
			runIn: ['text']
		});

		this.filter = this.filterInvites.bind(this);
	}

	public async run(message: KlasaMessage) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const invites = await message.guild!.fetchInvites();
		const topTen = invites
			.filter(this.filter)
			.sort((a, b) => b.uses! - a.uses!)
			.first(10) as NonNullableInvite[];

		if (topTen.length === 0) throw message.language.tget('COMMAND_TOPINVITES_NO_INVITES');

		const display = this.buildDisplay(message, topTen);

		await display.start(response, message.author.id);
		return response;
	}

	private buildDisplay(message: KlasaMessage, invites: NonNullableInvite[]) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setTitle(message.language.tget('COMMAND_TOPINVITES_TOP_10_INVITES_FOR', message.guild!))
			.setColor(getColor(message)));
		const embedData = message.language.tget('COMMAND_TOPINVITES_EMBED_DATA');

		for (const invite of invites) {
			display.addPage((embed: MessageEmbed) => embed
				.setAuthor(invite.inviter.tag, invite.inviter.displayAvatarURL())
				.setThumbnail(invite.inviter.displayAvatarURL())
				.setDescription([
					`**${embedData.USES}**: ${this.resolveUses(invite.uses, invite.maxUses)}`,
					`**${embedData.LINK}**: [${invite.code}](${invite.url})`,
					`**${embedData.CHANNEL}**: ${invite.channel}`,
					`**${embedData.TEMPORARY}**: ${invite.temporary ? Emojis.GreenTick : Emojis.RedCross}`
				].join('\n'))
				.addField(embedData.CREATED_AT, this.resolveCreationDate(invite.createdTimestamp, embedData.CREATED_AT_UNKNOWN), true)
				.addField(embedData.EXPIRES_IN, this.resolveExpiryDate(message, invite.expiresTimestamp, embedData.NEVER_EXPIRES), true));
		}

		return display;
	}

	private filterInvites(invite: Invite) {
		return invite.uses! > 0 && invite.inviter !== null;
	}

	private resolveUses(uses: Invite['uses'], maxUses: Invite['maxUses']) {
		if (maxUses !== null && maxUses > 0) return `${uses}/${maxUses}`;
		return uses;
	}

	private resolveExpiryDate(message: KlasaMessage, expiresTimestamp: Invite['expiresTimestamp'], fallback: string) {
		if (expiresTimestamp !== null && expiresTimestamp > 0) return message.language.duration((expiresTimestamp - Date.now()), 2);
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
