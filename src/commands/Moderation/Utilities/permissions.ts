import { getSupportedLanguageT, getSupportedUserLanguageT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { PermissionsBits, PermissionsBitsList } from '#utils/bits';
import { ModeratorPermissionsBits, ModeratorPermissionsList } from '#utils/constants';
import { getColor, getTag } from '#utils/util';
import { bold, chatInputApplicationCommandMention, EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, applyNameLocalizedBuilder, type TFunction } from '@sapphire/plugin-i18next';
import { ApplicationCommandType, GuildMember, PermissionFlagsBits } from 'discord.js';

const Root = LanguageKeys.Commands.Permissions;

@ApplyOptions<SkyraCommand.Options>({
	description: Root.Description,
	detailedDescription: LanguageKeys.Commands.Shared.SlashOnlyDetailedDescription,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	hidden: true
})
export class UserCommand extends SkyraCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				applyLocalizedBuilder(builder, Root.Name, Root.Description)
					.setDMPermission(false)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.addUserOption((option) => applyLocalizedBuilder(option, Root.OptionsUser))
					.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsListAll))
					.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsListMissing))
					.addBooleanOption((option) => applyLocalizedBuilder(option, Root.OptionsShow)),
			{
				idHints: [
					'1288416734960943135' // skyra-beta production
				]
			}
		);

		registry.registerContextMenuCommand(
			(builder) =>
				applyNameLocalizedBuilder(builder, Root.ContextMenuName)
					.setType(ApplicationCommandType.User)
					.setDMPermission(false)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
			{
				idHints: [
					'1288416736751648820' // skyra-beta production
				]
			}
		);
	}

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const content = args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, {
			command: chatInputApplicationCommandMention(this.name, this.getGlobalCommandId())
		});
		return send(message, { content });
	}

	public override chatInputRun(interaction: SkyraCommand.ChatInputInteraction) {
		const target = interaction.options.getMember('user') ?? interaction.member;
		const listAll = interaction.options.getBoolean('list-all') ?? false;
		const listMissing = interaction.options.getBoolean('list-missing') ?? false;
		const show = interaction.options.getBoolean('show') ?? false;

		return this.#sharedRun(interaction, target, listAll, listMissing, show);
	}

	public override contextMenuRun(interaction: SkyraCommand.UserContextMenuInteraction) {
		return this.#sharedRun(interaction, interaction.targetMember!, false, false, false);
	}

	#sharedRun(
		interaction: SkyraCommand.ChatInputInteraction | SkyraCommand.UserContextMenuInteraction,
		target: GuildMember,
		listAll: boolean,
		listMissing: boolean,
		show: boolean
	) {
		let content: string;
		const permissions = target.permissions.bitfield;

		const t = (show ? getSupportedLanguageT : getSupportedUserLanguageT)(interaction);
		if (PermissionsBits.has(permissions, PermissionFlagsBits.Administrator)) {
			content = t(LanguageKeys.Commands.Moderation.PermissionsAll);
		} else {
			const list = listAll ? PermissionsBitsList : ModeratorPermissionsList;
			content = listMissing ? this.#renderAllPermissions(t, permissions, list) : this.#renderPermissions(t, permissions, list);
		}

		const embed = new EmbedBuilder() //
			.setColor(getColor(interaction))
			.setTitle(t(Root.Title, { username: getTag(target.user), id: target.id }))
			.setDescription(content);
		return interaction.reply({ embeds: [embed], ephemeral: !show });
	}

	#renderPermissions(t: TFunction, permissions: bigint, list: readonly (readonly [string, bigint])[]): string {
		const output: string[] = [];
		for (const [name, flag] of list) {
			if (PermissionsBits.has(permissions, flag)) {
				const isModerator = this.#isModeratorFlag(flag);
				const localizedName = isModerator ? bold(this.#localizePermission(t, name)) : this.#localizePermission(t, name);

				output.push(localizedName);
			}
		}

		return t(LanguageKeys.Globals.AndListValue, { value: output });
	}

	#renderAllPermissions(t: TFunction, permissions: bigint, list: readonly (readonly [string, bigint])[]): string {
		const output: string[] = [];
		for (const [name, flag] of list) {
			const isModerator = this.#isModeratorFlag(flag);
			const localizedName = isModerator ? bold(this.#localizePermission(t, name)) : this.#localizePermission(t, name);

			if (PermissionsBits.has(permissions, flag)) {
				output.push(`${isModerator ? '🔸' : '🔹'} ${localizedName}`);
			} else {
				output.push(`-# ◾ ${localizedName}`);
			}
		}

		return output.join('\n');
	}

	#isModeratorFlag(flag: bigint) {
		return PermissionsBits.any(flag, ModeratorPermissionsBits);
	}

	#localizePermission(t: TFunction, name: string) {
		return t(`permissions:${name}`);
	}
}
