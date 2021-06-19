import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V43RemovedReferencesToUndesiredWords1616786337398 implements MigrationInterface {
	private readonly keys: readonly [previous: string, next: string][] = [
		['selfmod.links.whitelist', 'selfmod.links.allowed'],
		['selfmod.reactions.whitelist', 'selfmod.reactions.allowed'],
		['selfmod.reactions.blacklist', 'selfmod.reactions.blocked']
	];

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const [previous, next] of this.keys) {
			await queryRunner.renameColumn('guilds', previous, next);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const [previous, next] of this.keys) {
			await queryRunner.renameColumn('guilds', next, previous);
		}
	}
}
