import { DbSet, MemberEntity } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { User } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Social.SocialDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.SocialExtended),
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

			return message.sendLocale(amount === 1 ? LanguageKeys.Commands.Social.SocialAdd : LanguageKeys.Commands.Social.SocialAddPlural, [
				{ user: user.username, amount: newAmount, count: amount }
			]);
		}

		const created = new MemberEntity();
		created.userID = user.id;
		created.guildID = message.guild.id;
		created.points = amount;
		await members.insert(created);

		return message.sendLocale(amount === 1 ? LanguageKeys.Commands.Social.SocialAdd : LanguageKeys.Commands.Social.SocialAddPlural, [
			{ user: user.username, amount, count: amount }
		]);
	}

	public async remove(message: GuildMessage, [user, amount]: [User, number]) {
		const { members } = await DbSet.connect();
		const settings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		if (!settings) throw await message.fetchLocale(LanguageKeys.Commands.Social.SocialMemberNotexists);

		const newAmount = Math.max(settings.points - amount, 0);
		settings.points = newAmount;
		await settings.save();

		return message.sendLocale(amount === 1 ? LanguageKeys.Commands.Social.SocialRemove : LanguageKeys.Commands.Social.SocialRemovePlural, [
			{ user: user.username, amount: newAmount, count: amount }
		]);
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
		const language = await message.fetchLanguage();
		if (variation === 0) return language.get(LanguageKeys.Commands.Social.SocialUnchanged, { user: user.username });

		return message.sendMessage(
			variation > 0
				? language.get(variation === 1 ? LanguageKeys.Commands.Social.SocialAdd : LanguageKeys.Commands.Social.SocialAddPlural, {
						user: user.username,
						amount,
						count: variation
				  })
				: language.get(variation === -1 ? LanguageKeys.Commands.Social.SocialRemove : LanguageKeys.Commands.Social.SocialRemovePlural, {
						user: user.username,
						amount,
						count: -variation
				  })
		);
	}

	public async reset(message: GuildMessage, [user]: [User]) {
		const { members } = await DbSet.connect();
		await members.delete({ userID: user.id, guildID: message.guild.id });
		return message.sendLocale(LanguageKeys.Commands.Social.SocialReset, [{ user: user.username }]);
	}
}
