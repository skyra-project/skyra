class HungerGamesUsage {

	constructor(usage) {
		this.tributes = 0;
		this.deaths = new Set();
		this.parts = [];

		this.parse(usage);
	}

	display(...values) {
		return this.parts.map(part => typeof part === 'number' ? values[part] : part).join('');
	}

	parse(usage) {
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

	static create(usage) {
		return new HungerGamesUsage(usage);
	}

}

module.exports = HungerGamesUsage;
// console.log(new HungerGamesUsage('{1} sets an explosive off, killing {2T}, and {3T}.').display('AoDude', 'Kyra', 'Vlad'));
