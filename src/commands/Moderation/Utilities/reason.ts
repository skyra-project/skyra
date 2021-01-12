import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { getImage } from '#utils/util';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: LanguageKeys.Commands.Moderation.ReasonDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.ReasonExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<range:range{,50}> <reason:...string>',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'range',
		async (arg, possible, message) => {
			if (arg === 'latest') return [await message.guild!.moderation.count()];
			return message.client.arguments.get('range')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [cases, reason]: [number[], string]) {
		const entries = await message.guild.moderation.fetch(cases);
		if (!entries.size) {
			throw await message.resolveKey(LanguageKeys.Commands.Moderation.ModerationCaseNotExists, { count: cases.length });
		}

		const imageURL = getImage(message);
		const { moderations } = await DbSet.connect();
		await moderations
			.createQueryBuilder()
			.update()
			.where('guild_id = :guild', { guild: message.guild.id })
			.andWhere('case_id IN (:...ids)', { ids: [...entries.keys()] })
			.set({ reason, imageURL })
			.execute();
		await message.guild.moderation.fetchChannelMessages();
		for (const entry of entries.values()) {
			const clone = entry.clone();
			entry.setReason(reason).setImageURL(imageURL);
			this.client.emit(Events.ModerationEntryEdit, clone, entry);
		}

		return message.alert(
			(
				await message.resolveKey(LanguageKeys.Commands.Moderation.ReasonUpdated, {
					entries: cases,
					newReason: reason,
					count: cases.length
				})
			).join('\n')
		);
	}
}
