import type { MigrationInterface, QueryRunner } from 'typeorm';

export class V38UpdateBirthdayIntegration1616108184492 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const newEntries = this.transformOldToNew(
			await queryRunner.query(/* sql */ `SELECT id, data FROM public.schedule WHERE task_id = 'birthday';`)
		);

		for (const entry of newEntries) {
			await queryRunner.query(/* sql */ `UPDATE public.schedule SET data = $1::JSONB WHERE id = $2 AND task_id = 'birthday';`, [
				JSON.stringify(entry.data),
				entry.id
			]);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const oldEntries = this.transformNewToOld(
			await queryRunner.query(/* sql */ `SELECT id, data FROM public.schedule WHERE task_id = 'birthday';`)
		);

		for (const entry of oldEntries) {
			await queryRunner.query(/* sql */ `UPDATE public.schedule SET data = $1::JSONB WHERE id = $2 AND task_id = 'birthday';`, [
				JSON.stringify(entry.data),
				entry.id
			]);
		}
	}

	private transformOldToNew(birthdaySchedules: BirthdayStorage<OldBirthdayData>[]): BirthdayStorage<NewBirthdayData>[] {
		const newEntries: BirthdayStorage<NewBirthdayData>[] = [];

		for (const entry of birthdaySchedules) {
			const dateOfEntry = new Date(entry.data.birthDate);
			newEntries.push({
				id: entry.id,
				data: {
					guildID: entry.data.guildID,
					userID: entry.data.userID,
					day: dateOfEntry.getDate(),
					month: dateOfEntry.getMonth(),
					year: dateOfEntry.getFullYear()
				}
			});
		}

		return newEntries;
	}

	private transformNewToOld(birthdaySchedules: BirthdayStorage<NewBirthdayData>[]): BirthdayStorage<OldBirthdayData>[] {
		const newEntries: BirthdayStorage<OldBirthdayData>[] = [];

		for (const entry of birthdaySchedules) {
			const month = (entry.data.month - 1).toString().padStart(2, '0');

			newEntries.push({
				id: entry.id,
				data: {
					guildID: entry.data.guildID,
					userID: entry.data.userID,
					birthDate: `${entry.data.year}-${month}-${entry.data.day}T00:00:00.000Z`
				}
			});
		}

		return newEntries;
	}
}

interface BirthdayStorage<T extends OldBirthdayData | NewBirthdayData> {
	id: string;
	data: T;
}

interface OldBirthdayData {
	userID: string;
	guildID: string;
	birthDate: string;
}

interface NewBirthdayData {
	userID: string;
	guildID: string;
	year: number | null;
	month: number;
	day: number;
}
