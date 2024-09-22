import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { SkyraCommand } from '#lib/structures';
import { EmbedBuilder, TimestampStyles, time } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, version as sapphireVersion } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { applyLocalizedBuilder, type TFunction } from '@sapphire/plugin-i18next';
import {
	ButtonStyle,
	ComponentType,
	OAuth2Scopes,
	PermissionFlagsBits,
	chatInputApplicationCommandMention,
	version as djsVersion,
	type APIActionRowComponent,
	type APIEmbedField,
	type APIMessageActionRowComponent,
	type Message
} from 'discord.js';
import { cpus, uptime, type CpuInfo } from 'os';

const Root = LanguageKeys.Commands.Info;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bot-info', 'stats', 'sts'],
	description: Root.Description,
	detailedDescription: LanguageKeys.Commands.Shared.SlashOnlyDetailedDescription,
	hidden: true
})
export class UserCommand extends SkyraCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((command) => applyLocalizedBuilder(command, Root.Name, Root.Description), {
			idHints: [
				'1287399107224273059', // skyra production
				'1277288996011245578' // skyra-beta production
			]
		});
	}

	public override messageRun(message: Message, args: SkyraCommand.Args) {
		const content = args.t(LanguageKeys.Commands.Shared.DeprecatedMessage, {
			command: chatInputApplicationCommandMention(this.name, this.getGlobalCommandId())
		});
		return send(message, { content });
	}

	public override async chatInputRun(interaction: SkyraCommand.Interaction) {
		const t = getSupportedUserLanguageT(interaction);
		const embed = new EmbedBuilder()
			.setDescription(t(Root.EmbedDescription))
			.addFields(this.getApplicationStatistics(t), this.getUptimeStatistics(t), this.getServerUsageStatistics(t));
		const components = this.getComponents(t);

		return interaction.reply({ embeds: [embed], components, ephemeral: true });
	}

	private getApplicationStatistics(t: TFunction): APIEmbedField {
		return {
			name: t(Root.EmbedFieldApplicationTitle),
			value: t(Root.EmbedFieldApplicationValue, {
				channels: this.container.client.channels.cache.size,
				guilds: this.container.client.guilds.cache.size,
				users: this.container.client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0),
				versionNode: process.version,
				versionDiscord: `v${djsVersion}`,
				versionSapphire: `v${sapphireVersion}`
			})
		};
	}

	private getUptimeStatistics(t: TFunction): APIEmbedField {
		const now = Date.now();
		const nowSeconds = Math.round(now / 1000);

		return {
			name: t(Root.EmbedFieldUptimeTitle),
			value: t(Root.EmbedFieldUptimeValue, {
				host: time(Math.round(nowSeconds - uptime()), TimestampStyles.RelativeTime),
				client: time(Math.round(nowSeconds - process.uptime()), TimestampStyles.RelativeTime)
			})
		};
	}

	private getServerUsageStatistics(t: TFunction): APIEmbedField {
		const usage = process.memoryUsage();

		return {
			name: t(Root.EmbedFieldServerUsageTitle),
			value: t(Root.EmbedFieldServerUsageValue, {
				cpu: cpus().map(this.formatCpuInfo.bind(null)).join(' | '),
				heapUsed: (usage.heapUsed / 1048576).toLocaleString(t.lng, { maximumFractionDigits: 2 }),
				heapTotal: (usage.heapTotal / 1048576).toLocaleString(t.lng, { maximumFractionDigits: 2 })
			})
		};
	}

	private getComponents(t: TFunction) {
		const url = this.getInvite();
		const support = this.getSupportComponent(t);
		const github = this.getGitHubComponent(t);
		const donate = this.getDonateComponent(t);
		const data = url
			? [this.getActionRow(support, this.getInviteComponent(t, url)), this.getActionRow(github, donate)]
			: [this.getActionRow(support, github, donate)];

		return data;
	}

	private getActionRow(...components: APIMessageActionRowComponent[]): APIActionRowComponent<APIMessageActionRowComponent> {
		return { type: ComponentType.ActionRow, components };
	}

	private getSupportComponent(t: TFunction): APIMessageActionRowComponent {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: t(Root.ButtonSupport),
			emoji: { name: '🆘' },
			url: 'https://discord.gg/6gakFR2'
		};
	}

	private getInviteComponent(t: TFunction, url: string): APIMessageActionRowComponent {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: t(Root.ButtonInvite),
			emoji: { name: '🎉' },
			url
		};
	}

	private getGitHubComponent(t: TFunction): APIMessageActionRowComponent {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: t(Root.ButtonGitHub),
			emoji: { id: '950888087188283422', name: 'github2' },
			url: 'https://github.com/skyra-project/skyra'
		};
	}

	private getDonateComponent(t: TFunction): APIMessageActionRowComponent {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: t(Root.ButtonDonate),
			emoji: { name: '🧡' },
			url: 'https://donate.skyra.pw'
		};
	}

	private formatCpuInfo({ times }: CpuInfo) {
		return `${Math.round(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100}%`;
	}

	private getInvite() {
		return this.container.client.generateInvite({
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
			permissions:
				PermissionFlagsBits.AddReactions |
				PermissionFlagsBits.AttachFiles |
				PermissionFlagsBits.BanMembers |
				PermissionFlagsBits.ChangeNickname |
				PermissionFlagsBits.DeafenMembers |
				PermissionFlagsBits.EmbedLinks |
				PermissionFlagsBits.KickMembers |
				PermissionFlagsBits.ManageChannels |
				PermissionFlagsBits.ManageMessages |
				PermissionFlagsBits.ManageNicknames |
				PermissionFlagsBits.ManageRoles |
				PermissionFlagsBits.ManageThreads |
				PermissionFlagsBits.MoveMembers |
				PermissionFlagsBits.MuteMembers |
				PermissionFlagsBits.ReadMessageHistory |
				PermissionFlagsBits.SendMessages |
				PermissionFlagsBits.SendMessagesInThreads |
				PermissionFlagsBits.UseExternalEmojis |
				PermissionFlagsBits.ViewChannel
		});
	}
}
