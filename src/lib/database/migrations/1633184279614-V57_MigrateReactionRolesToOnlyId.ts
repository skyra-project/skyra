import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V57MigrateReactionRolesToOnlyId1633184279614 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const oldGuilds = (await queryRunner.query(
			/* sql */ `SELECT id, "reaction-roles" AS "reactionRoles" FROM public."guilds" WHERE jsonb_array_length("reaction-roles") >= 1;`
		)) as GuildData[];

		const newGuilds = this.mapReactions(oldGuilds);

		for (const guild of newGuilds) {
			await queryRunner.query(/* sql */ `UPDATE public."guilds" SET "reaction-roles" = $1::jsonb WHERE id = '${guild.id}';`, [
				JSON.stringify(guild.reactionRoles)
			]);
		}
	}

	public async down(_queryRunner: QueryRunner): Promise<void> {
		// noop
	}

	private mapReactions(guilds: GuildData[]): GuildData[] {
		for (const guild of guilds) {
			for (const [rrIndex, reaction] of guild.reactionRoles.entries()) {
				if (!reaction.emoji) {
					guild.reactionRoles.splice(rrIndex, 1);
					continue;
				}

				if (reaction.emoji.includes('%')) {
					continue;
				}

				const emojiId = reaction.emoji.split(':').at(-1)!;
				reaction.emoji = emojiId;
			}
		}

		return guilds;
	}
}

interface GuildData {
	id: string;
	reactionRoles: ReactionRole[];
}

interface ReactionRole {
	role: string;
	emoji: string;
	channel: string;
	message: string;
}
