import { remove as removeConfusables } from 'confusables';
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V49StripConfusablesFromWordFilter1618562933625 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const entries = (await queryRunner.query(
			/* sql */ `SELECT "id", "selfmod.filter.raw" FROM public.guilds WHERE array_length("selfmod.filter.raw", 1) <> 0;`
		)) as Entry[];

		for (const entry of entries) {
			await queryRunner.query(/* sql */ `UPDATE public.guilds SET "selfmod.filter.raw" = $2::VARCHAR[] WHERE id = $1;`, [
				entry.id,
				this.transform(entry)
			]);
		}
	}

	public async down(): Promise<void> {
		// No-op
	}

	private transform(entry: Entry) {
		const transformed = new Set<string>();
		for (const word of entry['selfmod.filter.raw']) {
			transformed.add(removeConfusables(word.toLowerCase()));
		}

		return [...transformed];
	}
}

interface Entry {
	id: string;
	'selfmod.filter.raw': string[];
}
