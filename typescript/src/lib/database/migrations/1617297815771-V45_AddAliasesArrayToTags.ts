import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V45AddAliasesArrayToTags1617297815771 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const entries = await this.getData<OldData>(queryRunner);
		for (const entry of entries) {
			for (const cc of entry['custom-commands']) {
				Reflect.set(cc, 'aliases', []);
			}

			await this.setData(queryRunner, entry);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const entries = await this.getData<NewData>(queryRunner);
		for (const entry of entries) {
			for (const cc of entry['custom-commands']) {
				Reflect.deleteProperty(cc, 'aliases');
			}

			await this.setData(queryRunner, entry);
		}
	}

	private getData<T extends OldData | NewData>(queryRunner: QueryRunner): Promise<T[]> {
		return queryRunner.query(/* sql */ `SELECT id, "custom-commands" FROM public.guilds WHERE JSONB_ARRAY_LENGTH("custom-commands") > 0;`);
	}

	private setData<T extends OldData | NewData>(queryRunner: QueryRunner, entry: T) {
		const cc = JSON.stringify(entry['custom-commands']).replaceAll("'", "''");
		return queryRunner.query(/* sql */ `
			UPDATE public.guilds
			SET "custom-commands" = '${cc}'::JSONB
			WHERE id = '${entry.id}';`);
	}
}

interface OldData {
	id: string;
	'custom-commands': {
		id: string;
		embed: boolean;
		color: number;
		content: string;
	}[];
}

interface NewData {
	id: string;
	'custom-commands': {
		id: string;
		embed: boolean;
		color: number;
		aliases: string[];
		content: string;
	}[];
}
