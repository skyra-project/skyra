import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Precondition } from '@sapphire/framework';

@ApplyOptions<Precondition.Options>({ position: 20 })
export class UserPrecondition extends Precondition {
	public async run(message: GuildMessage, command: SkyraCommand): Precondition.AsyncResult {
		// If not in a guild, resolve on an error:
		if (message.guild === null || message.member === null) return this.ok();

		// If it should skip, go directly to handle:
		if (this.shouldRun(message, command)) {
			const nodes = await message.guild.readSettings((settings) => settings.permissionNodes);
			const result = nodes.run(message.member, command);
			if (result) return this.ok();
			if (result === false) return this.error({ identifier: LanguageKeys.Preconditions.PermissionNodes });
		}

		return this.ok();
	}

	private shouldRun(message: GuildMessage, command: SkyraCommand) {
		// Guarded commands cannot be modified:
		if (command.guarded) return false;
		// Bot-owner commands cannot be modified:
		if (command.permissionLevel === PermissionLevels.BotOwner) return false;
		// If the author is owner of the guild, skip:
		if (message.author.id === message.guild.ownerID) return false;
		// In any other case, permission nodes should always run:
		return true;
	}
}
