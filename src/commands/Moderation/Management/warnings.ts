import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser, util } from 'klasa';
import { ModerationManagerEntry } from '../../../lib/structures/ModerationManagerEntry';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';
import { ModerationTypeKeys } from '../../../lib/util/constants';
import { getColor } from '../../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_WARNINGS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WARNINGS_EXTENDED'),
			permissionLevel: 5,
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	public async run(message: KlasaMessage, [target]: [KlasaUser?]) {
		const warnings = (await (target
			? message.guild!.moderation.fetch(target!.id)
			: message.guild!.moderation.fetch())).filter(log => log.type === ModerationTypeKeys.Warn);
		if (!warnings.size) throw message.language.tget('COMMAND_WARNINGS_EMPTY');

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL())
			.setTitle(message.language.tget('COMMAND_WARNINGS_AMOUNT', warnings.size)));

		// Fetch usernames
		const users = new Map() as Map<string, string>;
		for (const warning of warnings.values()) {
			const id = typeof warning.moderator === 'string' ? warning.moderator : warning.moderator!.id;
			if (!users.has(id)) users.set(id, await this.client.fetchUsername(id));
		}

		// Set up the formatter
		const format = this.displayWarning.bind(this, users);

		for (const page of util.chunk([...warnings.values()], 10)) {
			display.addPage(template => template.setDescription(page.map(format)));
		}

		const response = await message.sendEmbed(new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: getColor(message) || 0xFFAB2D })) as KlasaMessage;
		await display.run(response, message.author!.id);
		return response;
	}

	public displayWarning(users: Map<string, string>, warning: ModerationManagerEntry) {
		const id = typeof warning.moderator === 'string' ? warning.moderator : warning.moderator!.id;
		return `Case \`${warning.case}\`. Moderator: **${users.get(id)}**.\n${warning.reason || 'None'}`;
	}

}
