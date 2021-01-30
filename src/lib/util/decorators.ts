import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { createMethodDecorator } from '@sapphire/decorators';
import { Message, PermissionResolvable, Permissions } from 'discord.js';

/**
 * The inhibitor interface
 */
export interface Inhibitor {
	/**
	 * The arguments passed to the class' method
	 */
	(...args: any[]): boolean | Promise<boolean>;
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
 *		return createFunctionInhibitor((message: KlasaMessage) =>
 *			message.hasAtLeastPermissionLevel(value));
 *	}
 *
 *	// With fallback
 *	function requiresPermission(
 *		value: number,
 *		fallback: () => unknown = () => undefined
 *	) {
 *		return createFunctionInhibitor((message: KlasaMessage) =>
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

		descriptor.value = (async function descriptorValue(this: (...args: any[]) => any, ...args: any[]) {
			const canRun = await inhibitor(...args);
			return canRun ? method.call(this, ...args) : fallback.call(this, ...args);
		} as unknown) as undefined;
	});
}

/**
 * Allows you to set permissions required for individual methods.
 * @remark This decorator makes the decorated function asynchronous.
 * @param permissionsResolvable Permissions that the method should have.
 */
export const requiresLevel = (level: PermissionLevels, fallback?: Fallback): MethodDecorator => {
	return createFunctionInhibitor((message: GuildMessage) => {
		if (message.member.isOwner()) return true;

		switch (level) {
			case PermissionLevels.BotOwner:
				return false;
			case PermissionLevels.ServerOwner:
				return message.author.id === message.guild.ownerID;
			case PermissionLevels.Administrator:
				return message.member.isAdmin();
			case PermissionLevels.Moderator:
				return message.member.isModerator();
			case PermissionLevels.Everyone:
				return true;
		}
	}, fallback);
};

/**
 * Allows you to set permissions required for individual methods.
 * @remark This decorator makes the decorated function asynchronous.
 * @param permissionsResolvable Permissions that the method should have.
 */
export const requiresPermissions = (permissionsResolvable: PermissionResolvable): MethodDecorator => {
	const resolved = new Permissions(permissionsResolvable);
	return createFunctionInhibitor(async (message: GuildMessage) => {
		const missingPermissions = message.channel.permissionsFor(message.guild.me!)!.missing(resolved);

		if (missingPermissions.length) {
			const t = await message.fetchT();
			throw t('inhibitors:missingBotPerms', { missing: missingPermissions.map((permission) => t(`permissions:${permission}`)) });
		}

		return true;
	});
};

/**
 * Requires the message to be run in a guild context, this decorator requires the first argument to be a `Message` instance
 * @since 1.0.0
 * @param fallback The fallback value passed to `createFunctionInhibitor`
 */
export function requiresGuildContext(fallback: Fallback = (): void => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message) => message.guild !== null, fallback);
}

/**
 * Requires the message to be run in a dm context, this decorator requires the first argument to be a `Message` instance
 * @since 1.0.0
 * @param fallback The fallback value passed to `createFunctionInhibitor`
 */
export function requiresDMContext(fallback: Fallback = (): void => undefined): MethodDecorator {
	return createFunctionInhibitor((message: Message) => message.guild === null, fallback);
}
