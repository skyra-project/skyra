export class HungerGamesUsage {
	public tributes = 0;
	public deaths: Set<number> = new Set();
	private readonly parts: (string | number)[] = [];

	public constructor(usage: string) {
		this.parse(usage);
	}

	public display(...values: string[]) {
		return this.parts.map((part) => (typeof part === 'number' ? values[part] : part)).join('');
	}

	public parse(usage: string): void {
		let current = '';
		for (let i = 0, char; i < usage.length; i++) {
			char = usage.charAt(i);
			if (char === '{') {
				// If there was text, push buffer
				if (current) {
					this.parts.push(current);
					current = '';
				}

				// Parse tag {NT?}
				const n = Number(usage.charAt(++i));

				// If N > tributes, assign tributes to N
				if (n > this.tributes) this.tributes = n;

				// If NT, add death
				if (usage.charAt(++i) === 'T') {
					this.deaths.add(n - 1);
					i++;
				}

				this.parts.push(n - 1);
			} else {
				current += char;
			}
		}

		if (current) this.parts.push(current);
	}

	public static create(usage: string): HungerGamesUsage {
		return new HungerGamesUsage(usage);
	}
}
