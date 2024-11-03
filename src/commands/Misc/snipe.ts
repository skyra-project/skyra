import { getSupportedLanguageT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { Urls } from '#utils/constants';
import { getSnipedMessage } from '#utils/functions';
import { getColor, getContent, getFullEmbedAuthor, getImages, setMultipleEmbedImages } from '#utils/util';
import { EmbedBuilder, chatInputApplicationCommandMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import { InteractionContextType, PermissionFlagsBits, type GuildTextBasedChannel } from 'discord.js';

const Root = LanguageKeys.Commands.Snipe;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['sniped'],
	description: Root.Description,
	detailedDescription: LanguageKeys.Commands.Shared.SlashOnlyDetailedDescription,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	permissionLevel: PermissionLevels.Moderator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				applyLocalizedBuilder(builder, Root.Name, Root.Description)
					.setContexts(InteractionContextType.Guild)
					.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
			{
				idHints: [
					'1302710787877376082', // skyra production
					'1302704538351833160' // skyra-beta production
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
		const t = getSupportedLanguageT(interaction);
		const sniped = getSnipedMessage(interaction.channel as GuildTextBasedChannel);
		if (sniped === null) {
			const content = t(Root.MessageEmpty);
			return interaction.reply({ content, ephemeral: true });
		}

		const embed = new EmbedBuilder()
			.setURL(Urls.Website)
			.setFooter({ text: t(Root.EmbedTitle) })
			.setColor(getColor(sniped))
			.setAuthor(getFullEmbedAuthor(sniped.author))
			.setTimestamp(sniped.createdTimestamp);

		const content = getContent(sniped);
		if (content !== null) embed.setDescription(content);

		const embeds = setMultipleEmbedImages(embed, getImages(sniped));
		return interaction.reply({ embeds, ephemeral: true });
	}
}
