import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V60MigrateStarboardAndSuggestionEmojis1633267799333 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			ALTER TABLE public."guilds"
			ALTER COLUMN "suggestions.emojis.downvote"
			SET DEFAULT 's694594285269680179';`);
		await queryRunner.query(/* sql */ `
			ALTER TABLE public."guilds"
			ALTER COLUMN "suggestions.emojis.upvote"
			SET DEFAULT 's694594285487652954';`);

		const oldGuildData = (await queryRunner.query(/* sql */ `
			SELECT id,
				"starboard.emoji" AS "starboardEmoji",
				"suggestions.emojis.downvote" AS "downvoteEmoji",
				"suggestions.emojis.upvote" AS "upvoteEmoji"
			FROM public."guilds";
		;`)) as GuildData[];

		const newGuildData = this.upMap(oldGuildData);

		for (const guild of newGuildData) {
			await queryRunner.query(
				/* sql */ `
			UPDATE public."guilds"
			SET "starboard.emoji" = $1,
				"suggestions.emojis.downvote" = $2,
				"suggestions.emojis.upvote" = $3
			WHERE id = '${guild.id}';
			`,
				[guild.starboardEmoji, guild.downvoteEmoji, guild.upvoteEmoji]
			);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(/* sql */ `
			ALTER TABLE public."guilds"
			ALTER COLUMN "suggestions.emojis.downvote"
			SET DEFAULT ':ArrowB:694594285269680179';`);
		await queryRunner.query(/* sql */ `
			ALTER TABLE products
			ALTER COLUMN "suggestions.emojis.upvote"
			SET DEFAULT ':ArrowT:694594285487652954';`);

		const oldGuildData = (await queryRunner.query(/* sql */ `
			SELECT id,
				"starboard.emoji" AS "starboardEmoji",
				"suggestions.emojis.downvote" AS "downvoteEmoji",
				"suggestions.emojis.upvote" AS "upvoteEmoji"
			FROM public."guilds";
			;`)) as GuildData[];

		const newGuildData = this.downMap(oldGuildData);

		for (const guild of newGuildData) {
			await queryRunner.query(
				/* sql */ `
			UPDATE public."guilds"
			SET "starboard.emoji" = $1,
				"suggestions.emojis.downvote" = $2,
				"suggestions.emojis.upvote" = $3
			WHERE id = '${guild.id}';
			`,
				[guild.starboardEmoji, guild.downvoteEmoji, guild.upvoteEmoji]
			);
		}
	}

	private upMap(guilds: GuildData[]): GuildData[] {
		for (const guild of guilds) {
			if (guild.starboardEmoji.includes('%')) {
				continue;
			}

			const parts = guild.starboardEmoji.split(':');
			const emojiId = parts.at(-1)!;
			const emojiAnimated = parts.at(0);

			guild.starboardEmoji = `${emojiAnimated}${emojiId}`;
		}

		for (const guild of guilds) {
			if (guild.downvoteEmoji.includes('%')) {
				continue;
			}

			const parts = guild.downvoteEmoji.split(':');
			const emojiId = parts.at(-1)!;
			const emojiAnimated = parts.at(0);

			guild.downvoteEmoji = `${emojiAnimated || 's'}${emojiId}`;
		}

		for (const guild of guilds) {
			if (guild.upvoteEmoji.includes('%')) {
				continue;
			}

			const parts = guild.upvoteEmoji.split(':');
			const emojiId = parts.at(-1)!;
			const emojiAnimated = parts.at(0);

			guild.upvoteEmoji = `${emojiAnimated || 's'}${emojiId}`;
		}

		return guilds;
	}

	private downMap(guilds: GuildData[]): GuildData[] {
		for (const guild of guilds) {
			if (guild.starboardEmoji.includes('%')) {
				continue;
			}

			const emojiId = guild.starboardEmoji.slice(1);
			const emojiAnimated = guild.starboardEmoji.at(0) === 'a';

			guild.starboardEmoji = `${emojiAnimated ? 'a' : ''}:_:${emojiId}`;
		}

		for (const guild of guilds) {
			if (guild.downvoteEmoji.includes('%')) {
				continue;
			}

			const emojiId = guild.downvoteEmoji.slice(1);
			const emojiAnimated = guild.downvoteEmoji.at(0) === 'a';

			guild.downvoteEmoji = `${emojiAnimated ? 'a' : ''}:_:${emojiId}`;
		}

		for (const guild of guilds) {
			if (guild.upvoteEmoji.includes('%')) {
				continue;
			}

			const emojiId = guild.upvoteEmoji.slice(1);
			const emojiAnimated = guild.upvoteEmoji.at(0) === 'a';

			guild.upvoteEmoji = `${emojiAnimated ? 'a' : ''}:_:${emojiId}`;
		}

		return guilds;
	}
}

interface GuildData {
	id: string;
	starboardEmoji: string;
	downvoteEmoji: string;
	upvoteEmoji: string;
}
