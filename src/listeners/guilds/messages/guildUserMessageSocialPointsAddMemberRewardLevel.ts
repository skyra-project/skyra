import { GuildEntity, GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Difference, GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import type { GuildTextBasedChannelTypes } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { isNullishOrEmpty } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildUserMessageSocialPointsAddMemberReward })
export class UserListener extends Listener {
	private readonly regExp = /{((?:user|member)(?:\.(?:id|(?:user)?name|discriminator|tag))?|(?:guild|server)(?:\.(?:id|name))?|points|level)}/g;
	public async run(message: GuildMessage, difference: Difference<number>) {
		const previousLevel = this.getLevelFromPoints(difference.previous);
		const nextLevel = this.getLevelFromPoints(difference.next);

		if (previousLevel === nextLevel) return;

		const points = difference.next;
		const information = await readSettings(message.guild, (settings) => this.getInformation(settings));
		if (!information.announce) return;
		if (nextLevel % information.multiple !== 0) return;

		const channel = await this.ensureChannel(message, information.channel);
		if (channel === null) return;

		const content = this.getMessage(information.t, message.member, information.content, points);
		await channel.send({ content, allowedMentions: { roles: [], users: [message.author.id] } });
	}

	private getInformation(settings: GuildEntity) {
		const content = settings[GuildSettings.Social.AchieveLevel];
		if (isNullishOrEmpty(content)) return { announce: false } as const;

		return {
			announce: true,
			content,
			channel: settings[GuildSettings.Social.AchieveChannel] ?? null,
			multiple: settings[GuildSettings.Social.AchieveMultiple] ?? 1,
			t: settings.getLanguage()
		} as const;
	}

	private async ensureChannel(message: GuildMessage, channelId: string | null): Promise<GuildTextBasedChannelTypes | null> {
		if (channelId === null) return message.channel;

		const channels = message.guild.channels.cache;
		const channel = channels.get(channelId) as GuildTextBasedChannelTypes | undefined;
		if (channel !== undefined) return channel;

		await writeSettings(message.guild, [[GuildSettings.Social.AchieveChannel, null]]);
		return message.channel;
	}

	private getMessage(t: TFunction, member: GuildMember, content: string, points: number) {
		return content.replace(this.regExp, (match, value) => {
			switch (value) {
				case 'user':
				case 'member':
					return member.toString();
				case 'user.id':
				case 'member.id':
					return member.id;
				case 'user.name':
				case 'user.username':
				case 'member.username':
					return member.user.username;
				case 'member.name':
					return member.displayName;
				case 'user.tag':
				case 'member.tag':
					return member.user.tag;
				case 'server':
				case 'server.name':
				case 'guild':
				case 'guild.name':
					return member.guild.name;
				case 'server.id':
				case 'guild.id':
					return member.guild.id;
				case 'points':
					return t(LanguageKeys.Globals.NumberValue, { value: points });
				case 'level':
					return t(LanguageKeys.Globals.NumberValue, { value: this.getLevelFromPoints(points) });
				default:
					return match;
			}
		});
	}

	private getLevelFromPoints(points: number): number {
		return Math.floor(0.2 * Math.sqrt(points));
	}
}
