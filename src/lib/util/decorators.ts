import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { createMethodDecorator } from '@sapphire/decorators';
import { isDMChannel, isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { Awaited, UserError } from '@sapphire/framework';
import { Message, PermissionResolvable, Permissions } from 'discord.js';
import { isAdmin, isModerator, isOwner } from './functions';

/**
 * The inhibitor interface
 */
export interface Inhibitor {
	/**
	 * The arguments passed to the class' method
	 */
	(...args: any[]): Awaited<boolean>;
}

/**
 * The fallback interface, this is called when the inhibitor returns or resolves with a falsy value
 */
export interface Fallback {
	/**
	 * The arguments passed to the class' method
	 */
	(...args: any[]): unknown;
}

/**
 * Utility to make function inhibitors.
 *
 * ```ts
 *	// No fallback (returns undefined)
 *	function requiresPermission(value: number) {
 *		return createFunctionInhibitor((message: Message) =>
 *			message.hasAtLeastPermissionLevel(value));
 *	}
 *
 *	// With fallback
 *	function requiresPermission(
 *		value: number,
 *		fallback: () => unknown = () => undefined
 *	) {
 *		return createFunctionInhibitor((message: Message) =>
 *			message.hasAtLeastPermissionLevel(value), fallback);
 *	}
 * ```
 * @since 1.0.0
 * @param inhibitor The function that defines whether or not the function should be run, returning the returned value from fallback
 * @param fallback The fallback value that defines what the method should return in case the inhibitor fails
 */
export function createFunctionInhibitor(inhibitor: Inhibitor, fallback: Fallback = (): void => undefined): MethodDecorator {
	return createMethodDecorator((_target, _propertyKey, descriptor) => {
		const method = descriptor.value;
		if (!method) throw new Error('Function inhibitors require a [[value]].');
		if (typeof method !== 'function') throw new Error('Function inhibitors can only be applied to functions.');

		descriptor.value = async function descriptorValue(this: (...args: any[]) => any, ...args: any[]) {
			const canRun = await inhibitor(...args);
			return canRun ? method.call(this, ...args) : fallback.call(this, ...args);
		} as unknown as undefined;
	});
}

/**
 * Allows you to set permissions required for individual methods.
 * @remark This decorator makes the decorated function asynchronous.
 * @param permissionsResolvable Permissions that the method should have.
 * @param thrownError The error to be thrown. This gets assigned as the `identifier` property for a {@link UserError}
 * @param userErrorOptions Additional options to pass to the thrown {@link UserError}
 */
export const RequiresLevel = (
	level: PermissionLevels,
	thrownError: string,
	userErrorOptions?: Omit<UserError.Options, 'identifier'>
): MethodDecorator => {
	return createFunctionInhibitor(
		(message: GuildMessage) => {
			if (isOwner(message.member)) return true;

			switch (level) {
				case PermissionLevels.BotOwner:
					return false;
				case PermissionLevels.ServerOwner:
					return message.author.id === message.guild.ownerId;
				case PermissionLevels.Administrator:
					return isAdmin(message.member);
				case PermissionLevels.Moderator:
					return isModerator(message.member);
				case PermissionLevels.Everyone:
					return true;
			}
		},
		() => {
			throw new UserError({ identifier: thrownError, ...userErrorOptions });
		}
	);
};

const ServerOnlyPermissions = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);
/**
 * Allows you to set permissions required for individual methods.
 * @remark This decorator makes the decorated function asynchronous.
 * @param permissionsResolvable Permissions that the method should have.
 */
export const RequiresPermissions = (...permissionsResolvable: PermissionResolvable[]): MethodDecorator => {
	const resolved = new Permissions(permissionsResolvable);
	return createFunctionInhibitor((message: Message, args: SkyraArgs) => {
		if (isDMChannel(message.channel) && resolved.has(ServerOnlyPermissions)) {
			throw new UserError({ identifier: LanguageKeys.Preconditions.SubCommandGuildOnly });
		}

		if (isGuildBasedChannel(message.channel)) {
			const missingPermissions = message.channel.permissionsFor(message.guild!.me!)!.missing(resolved);

			if (missingPermissions.length) {
				throw new UserError({
					identifier: LanguageKeys.Preconditions.Permissions,
					context: {
						missing: missingPermissions.map((permission) => args.t(`permissions:${permission}`))
					}
				});
			}
		}

		return true;
	});
};

/**
 * Requires the message to be run in a guild context, this decorator requires the first argument to be a `Message` instance
 * @since 1.0.0
 * @param fallback The fallback value passed to `createFunctionInhibitor`
 */
export function RequiresGuildContext(fallback: Fallback = (): void => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message) => message.guild !== null, fallback);
}

/**
 * Requires the message to be run in a dm context, this decorator requires the first argument to be a `Message` instance
 * @since 1.0.0
 * @param fallback The fallback value passed to `createFunctionInhibitor`
 */
export function RequiresDMContext(fallback: Fallback = (): void => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message) => message.guild === null, fallback);
}
