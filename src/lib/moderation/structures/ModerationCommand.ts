import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getAction, type ActionByType, type GetContextType } from '#lib/moderation/actions';
import type { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import type { ModerationManager } from '#lib/moderation/managers/ModerationManager';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels, type GuildMessage, type TypedT } from '#lib/types';
import { asc, floatPromise, seconds } from '#utils/common';
import { deleteMessage, isGuildOwner } from '#utils/functions';
import type { TypeVariation } from '#utils/moderationConstants';
import { getImage, getTag, isUserSelf } from '#utils/util';
import { Args, CommandOptionsRunTypeEnum, type Awaitable } from '@sapphire/framework';
import { free, send } from '@sapphire/plugin-editable-commands';
import type { User } from 'discord.js';

const Root = LanguageKeys.Moderation;

export abstract class ModerationCommand<Type extends TypeVariation, ValueType> extends SkyraCommand {
	/**
	 * The moderation action this command applies.
	 */
	protected readonly action: ActionByType<Type>;

	/**
	 * Whether this command executes an undo action.
	 */
	protected readonly isUndoAction: boolean;

	/**
	 * The key for the action is active language key.
	 */
	protected readonly actionStatusKey: TypedT;

	/**
	 * Whether this command supports schedules.
	 */
	protected readonly supportsSchedule: boolean;

	/**
	 * The minimum duration for this command.
	 */
	protected readonly minimumDuration: number;

	/**
	 * The maximum duration for this command.
	 */
	protected readonly maximumDuration: number;

	/**
	 * Whether a member is required or not.
	 */
	protected readonly requiredMember: boolean;

	/**
	 * Whether a duration is required or not.
	 */
	protected readonly requiredDuration: boolean;

	protected constructor(context: ModerationCommand.Context, options: ModerationCommand.Options<Type>) {
		super(context, {
			cooldownDelay: seconds(5),
			flags: ['no-author', 'authored', 'no-dm', 'dm'],
			permissionLevel: PermissionLevels.Moderator,
			requiredMember: false,
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
			...options
		});

		this.action = getAction(options.type);
		this.isUndoAction = options.isUndoAction ?? false;
		this.actionStatusKey = options.actionStatusKey ?? (this.isUndoAction ? Root.ActionIsNotActive : Root.ActionIsActive);
		this.supportsSchedule = this.action.isUndoActionAvailable && !this.isUndoAction;
		this.minimumDuration = this.action.minimumDuration;
		this.maximumDuration = this.action.maximumDuration;
		this.requiredMember = options.requiredMember ?? false;
		this.requiredDuration = this.action.durationRequired;
	}

	public override messageRun(
		message: GuildMessage,
		args: ModerationCommand.Args,
		context: ModerationCommand.RunContext
	): Promise<GuildMessage | null>;

	public override async messageRun(message: GuildMessage, args: ModerationCommand.Args) {
		const resolved = await this.resolveParameters(args);
		const preHandled = await this.preHandle(message, resolved);
		const processed = [] as Array<{ log: ModerationManager.Entry; target: User }>;
		const errored = [] as Array<{ error: Error | string; target: User }>;

		const [shouldAutoDelete, shouldDisplayMessage, shouldDisplayReason] = await readSettings(message.guild, [
			GuildSettings.Messages.ModerationAutoDelete,
			GuildSettings.Messages.ModerationMessageDisplay,
			GuildSettings.Messages.ModerationReasonDisplay
		]);

		const { targets, ...handledRaw } = resolved;
		for (const target of new Set(targets)) {
			try {
				const handled = { ...handledRaw, args, target, preHandled };
				await this.checkTargetCanBeModerated(message, handled);
				const log = await this.handle(message, handled);
				processed.push({ log, target });
			} catch (error) {
				errored.push({ error: error as Error | string, target });
			}
		}

		try {
			await this.postHandle(message, { ...resolved, preHandled });
		} catch {
			// noop
		}

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (shouldAutoDelete) {
			if (message.deletable) floatPromise(deleteMessage(message));
		}

		if (shouldDisplayMessage) {
			const output: string[] = [];
			if (processed.length) {
				const reason = shouldDisplayReason ? processed[0].log.reason! : null;
				const sorted = processed.sort((a, b) => asc(a.log.id, b.log.id));
				const cases = sorted.map(({ log }) => log.id);
				const users = sorted.map(({ target }) => `\`${getTag(target)}\``);
				const range = cases.length === 1 ? cases[0] : `${cases[0]}..${cases[cases.length - 1]}`;
				const key = reason //
					? LanguageKeys.Commands.Moderation.ModerationOutputWithReason
					: LanguageKeys.Commands.Moderation.ModerationOutput;
				output.push(args.t(key, { count: cases.length, range, users, reason }));
			}

			if (errored.length) {
				const users = errored.map(({ error, target }) => `- ${getTag(target)} → ${typeof error === 'string' ? error : error.message}`);
				output.push(args.t(LanguageKeys.Commands.Moderation.ModerationFailed, { users: users.join('\n'), count: users.length }));
			}

			// Else send the message as usual.
			const content = output.join('\n');
			const response = await send(message, content);

			// If the server was configured to automatically delete messages, untrack the editable message so it doesn't
			// get automatically deleted in the event of race-conditions. `send` + `free` is used over
			// `message.channel.send` so it can edit any existing response.
			if (shouldAutoDelete) {
				free(message);
			}

			return response;
		}

		return null;
	}

	/**
	 * Handles an action before taking the moderation action.
	 *
	 * @param message - The message that triggered the command.
	 * @param context - The context for the moderation command, shared for all targets.
	 * @returns The value that will be set in {@linkcode ModerationCommand.HandlerParameters.preHandled}.
	 */
	protected preHandle(message: GuildMessage, context: ModerationCommand.Parameters): Awaitable<ValueType>;
	protected preHandle() {
		return null as ValueType;
	}

	/**
	 * Handles the moderation action.
	 *
	 * @param message - The message that triggered the command.
	 * @param context - The context for the moderation command, for a single target.
	 */
	protected handle(
		message: GuildMessage,
		context: ModerationCommand.HandlerParameters<ValueType>
	): Promise<ModerationManager.Entry> | ModerationManager.Entry;

	protected async handle(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		const dataContext = this.getHandleDataContext(message, context);

		const options = this.resolveOptions(message, context);
		const data = await this.getActionData(message, context.args, context.target, dataContext);
		const isActive = await this.isActionActive(message, context, dataContext);

		if (this.isUndoAction) {
			// If this command is an undo action, and the action is not active, throw an error.
			if (!isActive) {
				throw context.args.t(this.getActionStatusKey(context));
			}

			// @ts-expect-error mismatching types due to unions
			return this.action.undo(message.guild, options, data);
		}

		// If this command is not an undo action, and the action is active, throw an error.
		if (isActive) {
			throw context.args.t(this.getActionStatusKey(context));
		}

		// @ts-expect-error mismatching types due to unions
		return this.action.apply(message.guild, options, data);
	}

	/**
	 * Gets the data context required for some actions, if any.
	 *
	 * @param message - The message that triggered the command.
	 * @param context - The context for the moderation command, for a single target.
	 */
	protected getHandleDataContext(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>): GetContextType<Type>;
	protected getHandleDataContext(): GetContextType<Type> {
		return null as GetContextType<Type>;
	}

	/**
	 * Checks if the action is active.
	 *
	 * @param message - The message that triggered the command.
	 * @param context - The context for the moderation command, for a single target.
	 * @param dataContext - The data context required for some actions, if any.
	 * @returns
	 */
	protected isActionActive(
		message: GuildMessage,
		context: ModerationCommand.HandlerParameters<ValueType>,
		dataContext: GetContextType<Type>
	): Awaitable<boolean> {
		return this.action.isActive(message.guild, context.target.id, dataContext as never);
	}

	/**
	 * Gets the key for the action status language key.
	 *
	 * @remarks
	 *
	 * Unless overridden, this method just returns the value of {@linkcode ModerationCommand.actionStatusKey}.
	 *
	 * @param context - The context for the moderation command, for a single target.
	 */
	protected getActionStatusKey(context: ModerationCommand.HandlerParameters<ValueType>): TypedT;
	protected getActionStatusKey(): TypedT {
		return this.actionStatusKey;
	}

	/**
	 * Handles an action after taking the moderation action.
	 *
	 * @param message - The message that triggered the command.
	 * @param context - The context for the moderation command, shared for all targets.
	 */
	protected postHandle(message: GuildMessage, context: ModerationCommand.PostHandleParameters<ValueType>): unknown;
	protected postHandle() {
		return null;
	}

	protected async checkTargetCanBeModerated(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>) {
		if (context.target.id === message.author.id) {
			throw context.args.t(Root.ActionTargetSelf);
		}

		if (context.target.id === message.guild.ownerId) {
			throw context.args.t(Root.ActionTargetGuildOwner);
		}

		if (isUserSelf(context.target.id)) {
			throw context.args.t(Root.ActionTargetSkyra);
		}

		const member = await message.guild.members.fetch(context.target.id).catch(() => {
			if (this.requiredMember) throw context.args.t(LanguageKeys.Misc.UserNotInGuild);
			return null;
		});

		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;

			// Skyra cannot moderate members with higher role position than her:
			const me = await message.guild.members.fetchMe();
			if (targetHighestRolePosition >= me.roles.highest.position) {
				throw context.args.t(Root.ActionTargetHigherHierarchySkyra);
			}

			// A member who isn't a server owner is not allowed to moderate somebody with higher role than them:
			if (!isGuildOwner(message.member) && targetHighestRolePosition >= message.member.roles.highest.position) {
				throw context.args.t(Root.ActionTargetHigherHierarchyAuthor);
			}
		}

		return member;
	}

	protected async getActionData(
		message: GuildMessage,
		args: Args,
		target: User,
		context?: GetContextType<Type>
	): Promise<ModerationAction.Data<GetContextType<Type>>> {
		const [nameDisplay, enabledDM] = await readSettings(message.guild, [
			GuildSettings.Messages.ModeratorNameDisplay,
			GuildSettings.Messages.ModerationDM
		]);

		return {
			moderator: args.getFlags('no-author') ? null : args.getFlags('authored') || nameDisplay ? message.author : null,
			sendDirectMessage:
				// --no-dm disables
				!args.getFlags('no-dm') &&
				// --dm and enabledDM enable
				(args.getFlags('dm') || enabledDM) &&
				// user settings
				(await this.container.db.fetchModerationDirectMessageEnabled(target.id)),
			context
		};
	}

	protected resolveOptions(message: GuildMessage, context: ModerationCommand.HandlerParameters<ValueType>): ModerationAction.PartialOptions<Type> {
		return {
			user: context.target,
			moderator: message.author,
			reason: context.reason,
			imageURL: getImage(message),
			duration: context.duration
		};
	}

	/**
	 * Resolves the overloads for the moderation command.
	 *
	 * @param args - The arguments for the moderation command.
	 * @returns A promise that resolves to a CommandContext object containing the resolved targets, duration, and reason.
	 */
	protected async resolveParameters(args: ModerationCommand.Args): Promise<ModerationCommand.Parameters> {
		return {
			targets: await this.resolveParametersUser(args),
			duration: await this.resolveParametersDuration(args),
			reason: await this.resolveParametersReason(args)
		};
	}

	/**
	 * Resolves the value for {@linkcode Parameters.targets}.
	 *
	 * @param args - The arguments for the moderation command.
	 */
	protected resolveParametersUser(args: ModerationCommand.Args): Promise<User[]> {
		return args.repeat('user', { times: 10 });
	}

	/**
	 * Resolves the value for {@linkcode Parameters.duration}.
	 *
	 * @param args - The arguments for the moderation command.
	 */
	protected async resolveParametersDuration(args: ModerationCommand.Args) {
		if (!this.requiredDuration) {
			if (args.finished) return null;
			if (!this.supportsSchedule) return null;
		}

		const result = await args.pickResult('timespan', { minimum: this.minimumDuration, maximum: this.maximumDuration });
		return result.match({
			ok: (value) => value,
			err: (error) => {
				if (!this.requiredDuration && error.identifier === LanguageKeys.Arguments.TimeSpan) return null;
				throw error;
			}
		});
	}

	/**
	 * Resolves the value for {@linkcode Parameters.reason}.
	 *
	 * @param args - The arguments for the moderation command.
	 */
	protected resolveParametersReason(args: ModerationCommand.Args): Promise<string | null> {
		return args.finished ? Promise.resolve(null) : args.rest('string');
	}
}

export namespace ModerationCommand {
	/**
	 * The ModerationCommand Options
	 */
	export interface Options<Type extends TypeVariation> extends SkyraCommand.Options {
		type: Type;
		isUndoAction?: boolean;
		actionStatusKey?: TypedT;
		requiredMember?: boolean;
	}

	export type Args = SkyraCommand.Args;
	export type Context = SkyraCommand.LoaderContext;
	export type RunContext = SkyraCommand.RunContext;

	export interface Parameters {
		targets: User[];
		duration: number | null;
		reason: string | null;
	}

	export interface HandlerParameters<ValueType> extends Omit<Parameters, 'targets'> {
		args: Args;
		target: User;
		preHandled: ValueType;
	}

	export interface PostHandleParameters<ValueType> extends Parameters {
		preHandled: ValueType;
	}
}
