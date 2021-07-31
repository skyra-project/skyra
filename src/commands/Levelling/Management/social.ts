import { MemberEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { promptConfirmation } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@skyra/editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Social.SocialDescription,
	extendedHelp: LanguageKeys.Commands.Social.SocialExtended,
	flags: ['all'],
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['GUILD_ANY'],
	subCommands: ['add', 'remove', 'set', 'reset']
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const amount = await args.pick('integer', { minimum: 1, maximum: 1000000 });

		const { members } = this.container.db;
		const settings = await members.findOne({ where: { userId: user.id, guildId: message.guild.id } });
		if (settings) {
			const newAmount = settings.points + amount;
			settings.points = newAmount;
			await settings.save();

			const content = args.t(LanguageKeys.Commands.Social.SocialAdd, { user: user.username, amount: newAmount, count: amount });
			return send(message, content);
		}

		const created = new MemberEntity();
		created.userId = user.id;
		created.guildId = message.guild.id;
		created.points = amount;
		await members.insert(created);

		const content = args.t(LanguageKeys.Commands.Social.SocialAdd, { user: user.username, amount, count: amount });
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const amount = await args.pick('integer', { minimum: 1, maximum: 100000000 });

		const { members } = this.container.db;
		const settings = await members.findOne({ where: { userId: user.id, guildId: message.guild.id } });
		if (!settings) this.error(LanguageKeys.Commands.Social.SocialMemberNotExists);

		const newAmount = Math.max(settings.points - amount, 0);
		settings.points = newAmount;
		await settings.save();

		const content = args.t(LanguageKeys.Commands.Social.SocialRemove, { user: user.username, amount: newAmount, count: amount });
		return send(message, content);
	}

	public async set(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const amount = await args.pick('integer', { minimum: 0, maximum: 1000000 });

		const { members } = this.container.db;
		const settings = await members.findOne({ where: { userId: user.id, guildId: message.guild.id } });
		let oldValue = 0;
		if (settings) {
			oldValue = settings.points;
			settings.points = amount;
			await settings.save();
		} else {
			const created = new MemberEntity();
			created.userId = user.id;
			created.guildId = message.guild.id;
			created.points = amount;
			await members.insert(created);
		}

		const variation = amount - oldValue;
		if (variation === 0) return args.t(LanguageKeys.Commands.Social.SocialUnchanged, { user: user.username });

		const content =
			variation > 0
				? args.t(LanguageKeys.Commands.Social.SocialAdd, { user: user.username, amount, count: variation })
				: args.t(LanguageKeys.Commands.Social.SocialRemove, { user: user.username, amount, count: -variation });
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		if (args.getFlags('all')) return this.resetAll(message, args);

		const user = await args.pick('userName');
		const { members } = this.container.db;
		await members.delete({ userId: user.id, guildId: message.guild.id });

		const content = args.t(LanguageKeys.Commands.Social.SocialReset, { user: user.username });
		return send(message, content);
	}

	private async resetAll(message: GuildMessage, args: SkyraCommand.Args) {
		const confirmed = await promptConfirmation(message, args.t(LanguageKeys.Commands.Social.SocialResetAllPrompt));
		if (confirmed === null) this.error(LanguageKeys.Commands.Social.SocialResetAllTimeOut);
		if (!confirmed) this.error(LanguageKeys.Commands.Social.SocialResetAllAborted);

		const { members } = this.container.db;
		const result = await members.delete({ guildId: message.guild.id });
		if (!result.affected) this.error(LanguageKeys.Commands.Social.SocialResetAllEmpty);

		// Delete the local leaderboard entry since it's all set to 0 at this point.
		this.container.client.leaderboard.local.delete(message.guild.id);

		const content = args.t(LanguageKeys.Commands.Social.SocialResetAllSuccess, { count: result.affected });
		return send(message, content);
	}
}
