import { DbSet, MemberEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.SocialDescription,
	extendedHelp: LanguageKeys.Commands.Social.SocialExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subCommands: ['add', 'remove', 'set', 'reset']
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const amount = await args.pick('integer', { minimum: 1, maximum: 1000000 });

		const { members } = await DbSet.connect();
		const settings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		if (settings) {
			const newAmount = settings.points + amount;
			settings.points = newAmount;
			await settings.save();

			return message.send(args.t(LanguageKeys.Commands.Social.SocialAdd, { user: user.username, amount: newAmount, count: amount }));
		}

		const created = new MemberEntity();
		created.userID = user.id;
		created.guildID = message.guild.id;
		created.points = amount;
		await members.insert(created);

		return message.send(args.t(LanguageKeys.Commands.Social.SocialAdd, { user: user.username, amount, count: amount }));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const amount = await args.pick('integer', { minimum: 1, maximum: 100000000 });

		const { members } = await DbSet.connect();
		const settings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		if (!settings) throw args.t(LanguageKeys.Commands.Social.SocialMemberNotExists);

		const newAmount = Math.max(settings.points - amount, 0);
		settings.points = newAmount;
		await settings.save();

		return message.send(args.t(LanguageKeys.Commands.Social.SocialRemove, { user: user.username, amount: newAmount, count: amount }));
	}

	public async set(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const amount = await args.pick('integer', { minimum: 0, maximum: 1000000 });

		const { members } = await DbSet.connect();
		const settings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		let oldValue = 0;
		if (settings) {
			oldValue = settings.points;
			settings.points = amount;
			await settings.save();
		} else {
			const created = new MemberEntity();
			created.userID = user.id;
			created.guildID = message.guild.id;
			created.points = amount;
			await members.insert(created);
		}

		const variation = amount - oldValue;
		if (variation === 0) return args.t(LanguageKeys.Commands.Social.SocialUnchanged, { user: user.username });

		return message.send(
			variation > 0
				? args.t(LanguageKeys.Commands.Social.SocialAdd, {
						user: user.username,
						amount,
						count: variation
				  })
				: args.t(LanguageKeys.Commands.Social.SocialRemove, {
						user: user.username,
						amount,
						count: -variation
				  })
		);
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const { members } = await DbSet.connect();
		await members.delete({ userID: user.id, guildID: message.guild.id });
		return message.send(args.t(LanguageKeys.Commands.Social.SocialReset, { user: user.username }));
	}
}
