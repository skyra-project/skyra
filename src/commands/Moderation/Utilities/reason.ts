import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: language => language.tget('COMMAND_REASON_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_REASON_EXTENDED'),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<range:range{,50}> <reason:...string>',
			usageDelim: ' '
		});

		this.createCustomResolver('range', async (arg, possible, message) => {
			if (arg === 'latest') return [await message.guild!.moderation.count()];
			return this.client.arguments.get('range')!.run(arg, possible, message);
		});
	}

	public async run(message: KlasaMessage, [cases, reason]: [number[], string]) {
		const entries = await message.guild!.moderation.fetch(cases);
		if (!entries.size) throw message.language.tget(cases.length === 1 ? 'MODERATION_CASE_NOT_EXISTS' : 'MODERATION_CASES_NOT_EXIST');

		await this.client.queries.updateModerationLogReasonBulk(message.guild!.id, entries.map(ml => ml.case!), reason);
		await message.guild!.moderation.fetchChannelMessages();
		for (const entry of entries.values()) {
			const clone = entry.clone();
			entry.setReason(reason);
			this.client.emit(Events.ModerationEntryEdit, clone, entry);
		}

		return message.alert(message.language.tget('COMMAND_REASON_UPDATED', cases, reason));
	}

}
