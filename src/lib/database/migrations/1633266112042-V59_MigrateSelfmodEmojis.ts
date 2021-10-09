import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V59MigrateSelfmodEmojis1633266112042 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const oldBlockedReactionsGuilds = (await queryRunner.query(
			/* sql */ `SELECT id, "selfmod.reactions.blocked" as "roles" FROM public."guilds" WHERE array_length("selfmod.reactions.blocked", 1) > 0;`
		)) as GuildData[];

		const newBlockedReactionGuilds = this.upMapReactions(oldBlockedReactionsGuilds);

		for (const guild of newBlockedReactionGuilds) {
			await queryRunner.query(/* sql */ `UPDATE public."guilds" SET "selfmod.reactions.blocked" = $1 WHERE id = '${guild.id}';`, [guild.roles]);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const oldGuilds = (await queryRunner.query(
			/* sql */ `SELECT id, "selfmod.reactions.blocked" as "roles" FROM public."guilds" WHERE array_length("selfmod.reactions.blocked", 1) > 0;`
		)) as GuildData[];

		const newGuilds = this.downMapReactions(oldGuilds);

		for (const guild of newGuilds) {
			await queryRunner.query(/* sql */ `UPDATE public."guilds" SET "selfmod.reactions.blocked" = $1 WHERE id = '${guild.id}';`, [guild.roles]);
		}
	}

	private upMapReactions(guilds: GuildData[]): GuildData[] {
		for (const guild of guilds) {
			for (let reaction of guild.roles) {
				if (reaction.includes('%')) {
					continue;
				}

				const parts = reaction.split(':');
				const emojiId = parts.at(-1)!;
				const emojiAnimated = parts.at(0);

				reaction = `${emojiAnimated}${emojiId}`;
			}
		}

		return guilds;
	}

	private downMapReactions(guilds: GuildData[]): GuildData[] {
		for (const guild of guilds) {
			for (let reaction of guild.roles) {
				if (reaction.includes('%')) {
					continue;
				}

				const parts = reaction.split('a');
				const emojiId = parts.at(-1)!;
				const emojiAnimated = parts.at(0) === '';

				reaction = `${emojiAnimated ? 'a' : ''}:_:${emojiId}`;
			}
		}

		return guilds;
	}
}

interface GuildData {
	id: string;
	roles: string[];
}
