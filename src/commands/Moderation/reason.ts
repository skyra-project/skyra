import { Collection, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationManagerEntry } from '../../lib/structures/ModerationManagerEntry';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Events } from '../../lib/types/Enums';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { ModerationSchemaKeys } from '../../lib/util/constants';
import { parseRange } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: language => language.tget('COMMAND_REASON_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_REASON_EXTENDED'),
			permissionLevel: 5,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '(cases:case) <reason:...string>',
			usageDelim: ' '
		});

		this.createCustomResolver('case', async (arg, _, message) => {
			if (!arg) throw message.language.tget('COMMAND_REASON_MISSING_CASE');
			if (arg.toLowerCase() === 'latest') return [await message.guild!.moderation.count()];
			return parseRange(arg);
		});
	}

	public async run(message: KlasaMessage, [cases, reason]: [number[], string]) {
		const modlogs = await message.guild!.moderation.fetch(cases);
		if (!modlogs.size) throw message.language.tget('COMMAND_REASON_NOT_EXISTS');

		const channel = message.guild!.channels.get(message.guild!.settings.get(GuildSettings.Channels.ModerationLogs)) as TextChannel;
		const messages = channel ? await channel.messages.fetch({ limit: 100 }) as Collection<string, KlasaMessage> : null;

		const promises: Promise<void>[] = [];
		for (const modlog of modlogs.values()) {
			// Update the moderation case
			promises.push(this._updateReason(channel, messages, modlog, reason));
		}

		await Promise.all(promises);

		if (!channel) message.guild!.settings.reset(GuildSettings.Channels.ModerationLogs).catch(error => this.client.emit(Events.Wtf, error));
		return message.alert(message.language.tget('COMMAND_REASON_UPDATED', cases, reason));
	}

	public async _updateReason(channel: TextChannel, messages: Collection<string, KlasaMessage> | null, modlog: ModerationManagerEntry, reason: string | null) {
		await modlog.edit({ [ModerationSchemaKeys.Reason]: reason });

		if (channel) {
			const message = messages!.find(mes => mes.author!.id === this.client.user!.id
				&& mes.embeds.length > 0
				&& mes.embeds[0].type === 'rich'
				&& Boolean(mes.embeds[0].footer) && mes.embeds[0].footer!.text === `Case ${modlog.case}`);

			const embed = await modlog.prepareEmbed();
			if (message) await message.edit(embed);
			else await channel.send(embed);
		}
	}

}
