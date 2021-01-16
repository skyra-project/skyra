import { DbSet, MemberEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import type { User } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.SocialDescription,
	extendedHelp: LanguageKeys.Commands.Social.SocialExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subcommands: true,
	usage: '<add|remove|set|reset> <user:username> (amount:money{0,1000000})',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'money',
		(arg, possible, message, [type]) => {
			if (type === 'reset') return null;
			return message.client.arguments.get('integer')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	public async add(message: GuildMessage, [user, amount]: [User, number]) {
		const { members } = await DbSet.connect();
		const settings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		if (settings) {
			const newAmount = settings.points + amount;
			settings.points = newAmount;
			await settings.save();

			return message.sendTranslated(LanguageKeys.Commands.Social.SocialAdd, [{ user: user.username, amount: newAmount, count: amount }]);
		}

		const created = new MemberEntity();
		created.userID = user.id;
		created.guildID = message.guild.id;
		created.points = amount;
		await members.insert(created);

		return message.sendTranslated(LanguageKeys.Commands.Social.SocialAdd, [{ user: user.username, amount, count: amount }]);
	}

	public async remove(message: GuildMessage, [user, amount]: [User, number]) {
		const { members } = await DbSet.connect();
		const settings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		if (!settings) throw await message.resolveKey(LanguageKeys.Commands.Social.SocialMemberNotExists);

		const newAmount = Math.max(settings.points - amount, 0);
		settings.points = newAmount;
		await settings.save();

		return message.sendTranslated(LanguageKeys.Commands.Social.SocialRemove, [{ user: user.username, amount: newAmount, count: amount }]);
	}

	public async set(message: GuildMessage, [user, amount]: [User, number]) {
		// If sets to zero, it shall reset
		if (amount === 0) return this.reset(message, [user]);

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
		const t = await message.fetchT();
		if (variation === 0) return t(LanguageKeys.Commands.Social.SocialUnchanged, { user: user.username });

		return message.send(
			variation > 0
				? t(LanguageKeys.Commands.Social.SocialAdd, {
						user: user.username,
						amount,
						count: variation
				  })
				: t(LanguageKeys.Commands.Social.SocialRemove, {
						user: user.username,
						amount,
						count: -variation
				  })
		);
	}

	public async reset(message: GuildMessage, [user]: [User]) {
		const { members } = await DbSet.connect();
		await members.delete({ userID: user.id, guildID: message.guild.id });
		return message.sendTranslated(LanguageKeys.Commands.Social.SocialReset, [{ user: user.username }]);
	}
}
