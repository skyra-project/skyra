import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { ModerationTypeKeys, BrandingColors } from '../../../lib/util/constants';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';
import { getColor } from '../../../lib/util/util';
import { chunk } from '@klasa/utils';
import { ModerationManagerEntry } from '../../../lib/structures/ModerationManagerEntry';
import Collection from '@discordjs/collection';

const COLORS = [0x80F31F, 0xA5DE0B, 0xC7C101, 0xE39E03, 0xF6780F, 0xFE5326, 0xFB3244];

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_HISTORY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_HISTORY_EXTENDED'),
			permissionLevel: 5,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<details|overview:default> [user:username]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	public async overview(message: KlasaMessage, [target = message.author]: [KlasaUser]) {
		const logs = await message.guild!.moderation.fetch(target.id);
		let warnings = 0;
		let mutes = 0;
		let kicks = 0;
		let bans = 0;
		for (const log of logs.values()) {
			switch (log.basicType) {
				case ModerationTypeKeys.Ban:
				case ModerationTypeKeys.Softban: bans++;
					break;
				case ModerationTypeKeys.Mute: mutes++;
					break;
				case ModerationTypeKeys.Kick: kicks++;
					break;
				case ModerationTypeKeys.Warn: warnings++;
			}
		}

		const index = Math.min(COLORS.length - 1, warnings + mutes + kicks + bans);

		return message.sendEmbed(new MessageEmbed()
			.setColor(COLORS[index])
			.setAuthor(target.username, target.displayAvatarURL())
			.setFooter(message.language.tget('COMMAND_HISTORY_FOOTER', warnings, mutes, kicks, bans)));
	}

	public async details(message: KlasaMessage, [target = message.author]: [KlasaUser]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const entries = await message.guild!.moderation.fetch(target.id);
		if (!entries.size) throw message.language.tget('COMMAND_MODERATIONS_EMPTY');

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL())
			.setTitle(message.language.tget('COMMAND_MODERATIONS_AMOUNT', entries.size)));

		// Fetch usernames
		const usernames = await this.fetchAllModerators(entries);

		// Set up the formatter
		const durationDisplay = message.language.duration.bind(message.language);
		const format = this.displayModerationLogFromModerators.bind(this, usernames, durationDisplay);

		for (const page of chunk([...entries.values()], 10)) {
			display.addPage((template: MessageEmbed) => template.setDescription(page.map(format)));
		}

		await display.start(response, message.author.id);
		return response;
	}

	private displayModerationLogFromModerators(users: Map<string, string>, duration: DurationDisplay, entry: ModerationManagerEntry) {
		const remainingTime = entry.duration === null || entry.createdAt === null ? null : (entry.createdAt + entry.duration) - Date.now();
		const formattedModerator = users.get(entry.flattenedModerator);
		const formattedReason = entry.reason || 'None';
		const formattedAppeal = entry.appealed ? ' (Appealed)' : '';
		const formattedTitle = `**${entry.name}${formattedAppeal}**\n`;
		const formattedDuration = entry.appealed
			? ''
			: remainingTime === null
				? ''
				: `\nExpires in: ${duration(remainingTime)}`;
		return `${formattedTitle}Case \`${entry.case}\`. Moderator: **${formattedModerator}**.\n${formattedReason}${formattedDuration}`;
	}

	private async fetchAllModerators(entries: Collection<number, ModerationManagerEntry>) {
		const moderators = new Map() as Map<string, string>;
		for (const entry of entries.values()) {
			const id = entry.flattenedModerator;
			if (!moderators.has(id)) moderators.set(id, await this.client.fetchUsername(id));
		}
		return moderators;
	}

}

type DurationDisplay = (time: number) => string;
