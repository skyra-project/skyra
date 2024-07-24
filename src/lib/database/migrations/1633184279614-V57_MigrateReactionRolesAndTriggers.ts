import type { SerializedEmoji } from '#utils/functions';
import { TwemojiRegex } from '@sapphire/discord-utilities';
import type { MigrationInterface, QueryRunner } from 'typeorm';
import type { ReactionRole } from '#lib/database/entities/GuildEntity';

export class V57MigrateReactionRolesAndTriggers1633184279614 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const oldGuilds = (await queryRunner.query(/* sql */ `
			SELECT id,
				"reaction-roles" AS "reactionRoles",
				"trigger.includes" AS "triggerIncludes"
			FROM public."guilds"
			WHERE jsonb_array_length("reaction-roles") >= 1
			OR jsonb_array_length("trigger.includes") >= 1
		;`)) as GuildData[];

		const newGuilds = this.upMapReactions(oldGuilds);

		for (const guild of newGuilds) {
			await queryRunner.query(
				/* sql */ `
					UPDATE public."guilds"
					SET "reaction-roles" = $1::jsonb,
						"trigger.includes" = $2::jsonb
					WHERE id = '${guild.id}';
			`,
				[JSON.stringify(guild.reactionRoles), JSON.stringify(guild.triggerIncludes)]
			);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const oldGuilds = (await queryRunner.query(/* sql */ `
			SELECT id,
				"reaction-roles" AS "reactionRoles",
				"trigger.includes" AS "triggerIncludes"
			FROM public."guilds"
			WHERE jsonb_array_length("reaction-roles") >= 1
			OR jsonb_array_length("trigger.includes") >= 1
		;`)) as GuildData[];

		const newGuilds = this.downMapReactions(oldGuilds);

		for (const guild of newGuilds) {
			await queryRunner.query(
				/* sql */ `
					UPDATE public."guilds"
					SET "reaction-roles" = $1::jsonb,
						"trigger.includes" = $2::jsonb
					WHERE id = '${guild.id}';
			`,
				[JSON.stringify(guild.reactionRoles), JSON.stringify(guild.triggerIncludes)]
			);
		}
	}

	private upMapReactions(guilds: GuildData[]): GuildData[] {
		for (const guild of guilds) {
			for (const [rrIndex, reaction] of guild.reactionRoles.entries()) {
				if (!reaction.emoji) {
					guild.reactionRoles.splice(rrIndex, 1);
					continue;
				}

				if (reaction.emoji.includes('%')) {
					continue;
				}

				const parts = reaction.emoji.split(':');
				const emojiId = parts.at(-1)!;
				const emojiAnimated = parts.at(0);

				// @ts-expect-error writing readonly property
				reaction.emoji = `${emojiAnimated}${emojiId}` as SerializedEmoji;
			}

			for (const [tiIndex, trigger] of guild.triggerIncludes.entries()) {
				if (trigger.action !== 'react') {
					continue;
				}

				if (!trigger.output) {
					guild.triggerIncludes.splice(tiIndex, 1);
					continue;
				}

				if (trigger.output.includes('%')) {
					continue;
				}

				if (TwemojiRegex.test(trigger.output)) {
					trigger.output = encodeURIComponent(trigger.output) as SerializedEmoji;
				} else {
					const parts = trigger.output.split(':');
					const emojiId = parts.at(-1)!;
					const emojiAnimated = parts.at(0);

					trigger.output = `${emojiAnimated}${emojiId}` as SerializedEmoji;
				}
			}
		}

		return guilds;
	}

	private downMapReactions(guilds: GuildData[]): GuildData[] {
		for (const guild of guilds) {
			for (const [rrIndex, reaction] of guild.reactionRoles.entries()) {
				if (!reaction.emoji) {
					guild.reactionRoles.splice(rrIndex, 1);
					continue;
				}

				if (reaction.emoji.includes('%')) {
					continue;
				}

				const emojiId = reaction.emoji.slice(1);
				const emojiAnimated = reaction.emoji.at(0) === 'a';

				// @ts-expect-error writing readonly property
				reaction.emoji = `${emojiAnimated ? 'a' : ''}:_:${emojiId}` as SerializedEmoji;
			}

			for (const [tiIndex, trigger] of guild.triggerIncludes.entries()) {
				if (trigger.action !== 'react') {
					continue;
				}

				if (!trigger.output) {
					guild.triggerIncludes.splice(tiIndex, 1);
					continue;
				}

				if (trigger.output.includes('%')) {
					continue;
				}

				const emojiId = trigger.output.slice(1);
				const emojiAnimated = trigger.output.at(0) === 'a';

				trigger.output = `${emojiAnimated ? 'a' : ''}:_:${emojiId}` as SerializedEmoji;
			}
		}

		return guilds;
	}
}

interface GuildData {
	id: string;
	reactionRoles: ReactionRole[];
	triggerIncludes: TriggerIncludes[];
}

interface TriggerIncludes {
	action: 'react';
	input: string;
	output: SerializedEmoji;
}
