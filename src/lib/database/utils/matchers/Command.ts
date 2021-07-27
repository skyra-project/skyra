import type { SkyraCommand } from '#lib/structures';
import type { CommandStore } from '@sapphire/framework';
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

export function matchAny(names: Iterable<string>, command: SkyraCommand): boolean {
	for (const name of names) {
		if (match(name, command)) return true;
	}
	return false;
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

function resolveCategory(commands: CommandStore, category: string): string | null {
	const scanned = new Set<string>();
	const lowerCaseCategory = category.toLowerCase();

	for (const command of commands.values()) {
		const value = (command as SkyraCommand).category;
		if (scanned.has(value)) continue;
		if (value.toLowerCase() === lowerCaseCategory) return value;
		scanned.add(value);
	}

	return null;
}

function resolveSubCategory(commands: CommandStore, category: string, subCategory: string): string | null {
	const scanned = new Set<string>();
	const lowerCaseSubCategory = subCategory.toLowerCase();

	for (const cmd of commands.values()) {
		const command = cmd as SkyraCommand;
		if (command.category !== category) continue;

		if (scanned.has(command.subCategory)) continue;
		if (command.subCategory.toLowerCase() === lowerCaseSubCategory) return command.subCategory;
		scanned.add(command.subCategory);
	}

	return null;
}

function resolveCommandWithCategory(commands: CommandStore, name: string, category: string): string | null {
	const command = commands.get(name) as SkyraCommand | undefined;
	if (command === undefined) return null;
	return command.category === category ? command.name : null;
}

function resolveCommandWithCategoryAndSubCategory(commands: CommandStore, name: string, category: string, subCategory: string): string | null {
	const command = commands.get(name) as SkyraCommand | undefined;
	if (command === undefined) return null;
	return command.category === category && command.subCategory === subCategory ? command.name : null;
}

export function resolve(name: string): string | null {
	// Match All:
	if (name === '*') return name;

	const parts = name.split('.');

	// If it's an empty string, or has more than three parts, it is invalid:
	if (parts.length === 0 || parts.length > 3) return null;

	const commands = Store.injectedContext.stores.get('commands');

	// Handle `${command}`:
	if (parts.length === 1) return commands.get(name.toLowerCase())?.name ?? null;

	// Handle `${category}.${string}`:
	const category = resolveCategory(commands, parts[0]);
	if (category === null) return null;
	if (parts.length === 2) return parts[1] === '*' ? `${category}.*` : resolveCommandWithCategory(commands, parts[1].toLowerCase(), category);

	// Handle `${category}.${category}.${string}`:
	const subCategory = resolveSubCategory(commands, category, parts[1]);
	if (subCategory === null) return null;
	return parts[2] === '*'
		? `${category}.${subCategory}.*`
		: resolveCommandWithCategoryAndSubCategory(commands, parts[2].toLowerCase(), category, subCategory);
}
