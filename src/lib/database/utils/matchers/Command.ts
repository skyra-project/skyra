import { SkyraCommand } from '#lib/structures';
import { CommandStore } from '@sapphire/framework';
import { Store } from '@sapphire/pieces';

function getNameSpaceDetails(name: string): readonly [string | null, string] {
	const index = name.indexOf('.');
	if (index === -1) return [null, name];
	return [name.substring(0, index), name.substring(index + 1)];
}

function matchName(name: string, command: SkyraCommand): boolean {
	return command.name === name || command.aliases.some((alias) => alias === name);
}

function matchNameAndCategory(name: string, category: string, command: SkyraCommand): boolean {
	return command.category === category && matchName(name, command);
}

function matchNameCategoryAndSubCategory(name: string, category: string, subCategory: string, command: SkyraCommand): boolean {
	return command.subCategory === subCategory && matchNameAndCategory(name, category, command);
}

export function match(name: string, command: SkyraCommand): boolean {
	// Match All:
	if (name === '*') return true;

	// Match Category:
	const [category, categoryRest] = getNameSpaceDetails(name);
	if (category === null) return matchName(name, command);
	if (category !== command.category) return false;
	if (categoryRest === '*') return true;

	// Match Sub-Category:
	const [subCategory, subCategoryRest] = getNameSpaceDetails(categoryRest);
	if (subCategory === null) return matchNameAndCategory(name, category, command);
	if (subCategory !== command.subCategory) return false;
	if (subCategoryRest === '*') return true;

	// Match Command:
	return matchNameCategoryAndSubCategory(subCategoryRest, category, subCategory, command);
}

function hasCategory(commands: CommandStore, category: string): boolean {
	for (const command of commands.values()) {
		if ((command as SkyraCommand).category === category) return true;
	}

	return false;
}

function hasSubCategory(commands: CommandStore, subCategory: string): boolean {
	for (const command of commands.values()) {
		if ((command as SkyraCommand).subCategory === subCategory) return true;
	}

	return false;
}

export function resolve(name: string): string | null {
	// Match All:
	if (name === '*') return name;

	const commands = Store.injectedContext.stores.get('commands');

	// Match Category:
	const [category, categoryRest] = getNameSpaceDetails(name);
	if (category === null) return commands.get(name)?.name ?? null;
	if (!hasCategory(commands, category)) return null;
	if (categoryRest === '*') return name;

	// Match Sub-Category
	const [subCategory, subCategoryRest] = getNameSpaceDetails(categoryRest);
	if (subCategory === null) {
		const command = commands.get(name);
		if (command === undefined) return null;
		return matchNameAndCategory(name, category, command as SkyraCommand) ? name : null;
	}
	if (!hasSubCategory(commands, subCategory)) return null;
	if (subCategoryRest === '*') return name;

	return null;
}
