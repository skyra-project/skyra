import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser, util } from 'klasa';
import { ModerationManagerEntry } from '../../../lib/structures/ModerationManagerEntry';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';
import { ModerationTypeKeys, BrandingColors } from '../../../lib/util/constants';
import { getColor } from '../../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_MUTES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MUTES_EXTENDED'),
			permissionLevel: 5,
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [target]: [KlasaUser?]) {
		const response = await message.sendEmbed(new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: BrandingColors.Secondary }));
		const mutes = (await (target
			? message.guild!.moderation.fetch(target.id)
			: message.guild!.moderation.fetch())).filter(log => log.type === ModerationTypeKeys.Mute || log.type === ModerationTypeKeys.TemporaryMute);
		if (!mutes.size) throw message.language.tget('COMMAND_MUTES_EMPTY');

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL())
			.setTitle(message.language.tget('COMMAND_MUTES_AMOUNT', mutes.size)));

		// Fetch usernames
		const users = new Map() as Map<string, string>;
		for (const mute of mutes.values()) {
			const id = typeof mute.user === 'string' ? mute.user : mute.user!.id;
			if (!users.has(id)) users.set(id, await this.client.fetchUsername(id));
		}

		// Set up the formatter
		const format = this.displayMute.bind(this, users, message.language.duration.bind(message.language));

		for (const page of util.chunk([...mutes.values()], 10)) {
			display.addPage((template: MessageEmbed) => template.setDescription(page.map(format)));
		}

		await display.start(response, message.author.id);
		return response;
	}

	public displayMute(users: Map<string, string>, duration: (time: number) => string, mute: ModerationManagerEntry) {
		const id = typeof mute.user === 'string' ? mute.user : mute.user!.id;
		const remainingTime = mute.duration === null || mute.createdAt === null ? null : (mute.createdAt + mute.duration) - Date.now();
		const formattedUser = users.get(id);
		const formattedReason = mute.reason || 'None';
		const formattedDuration = remainingTime === null ? '' : `\nExpires in: ${duration(remainingTime)}`;
		return `Case \`${mute.case}\`. User: **${formattedUser}**.\n${formattedReason}${formattedDuration}`;
	}

}
