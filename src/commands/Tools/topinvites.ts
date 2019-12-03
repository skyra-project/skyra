import { CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Invite, MessageEmbed } from 'discord.js';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { getColor } from '../../lib/util/util';
import { DeepRequired } from '../../lib/util/External/utility-types';
import { BrandingColors } from '../../lib/util/constants';

export default class extends SkyraCommand {

	private inviteTimestamp = new Timestamp('MMMM d YYYY - HH:mm');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['topinvs'],
			cooldown: 10,
			description: language => language.tget('COMMAND_TOPINVITES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_TOPINVITES_EXTENDED'),
			requiredGuildPermissions: ['MANAGE_GUILD'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const invites = await message.guild!.fetchInvites();
		const topTen = invites
			.filter(inv => this.filterInvites(inv))
			.sort((a, b) => b.uses! - a.uses!)
			.first(10) as DeepRequired<Invite[]>;

		if (topTen.length === 0) throw message.language.tget('COMMAND_TOPINVITES_NO_INVITES');

		const display = this.buildDisplay(message, topTen);

		await display.start(response, message.author.id);
		return response;
	}

	private filterInvites(invite: Invite) {
		return invite.uses > 0 && invite.inviter !== null;
	}

	private buildDisplay(message: KlasaMessage, invites: DeepRequired<Invite[]>) {
		const display = new UserRichDisplay(new MessageEmbed()
			.setTitle(`Top 10 Invites for ${message.guild!.name}`)
			.setColor(getColor(message)));
		const embedData = message.language.tget('COMMAND_TOPINVITES_EMBED_DATA');

		for (const invite of invites) {
			display.addPage((embed: MessageEmbed) => embed
				.setAuthor(invite.inviter.tag, invite.inviter.displayAvatarURL())
				.setThumbnail(invite.inviter.displayAvatarURL())
				.addField(embedData.CHANNEL, `<#${invite.channel.id}>`, true)
				.addField(embedData.CODE, invite.code, true)
				.addField(embedData.URL, invite.url, true)
				.addField(embedData.CREATED_AT, invite.createdTimestamp ? this.inviteTimestamp.display(invite.createdTimestamp) : embedData.CREATED_AT_UNKNOWN, true)
				.addField(embedData.EXPIRES_AT, invite.expiresTimestamp ? this.inviteTimestamp.display(invite.expiresTimestamp) : embedData.EXPIRES_AT_UNKNOWN, true)
				.addField(embedData.MAX_AGE, invite.maxAge ? message.language.duration(invite.maxAge * 1000) : embedData.NO_MAX_AGE, true)
				.addField(embedData.MAX_USES, invite.maxUses ? invite.maxUses : embedData.NO_MAX_USES, true)
				.addField(embedData.TEMPORARY, invite.temporary ? embedData.IS_TEMPORARY : embedData.IS_NOT_TEMPORARY, true)
				.addField(embedData.USES, invite.uses, true));
		}

		return display;
	}

}
