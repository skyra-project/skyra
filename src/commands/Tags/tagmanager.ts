const { Command } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_TAGMANAGER_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_TAGMANAGER_EXTENDED'),
			permissionLevel: 4,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|edit|remove> <tag:string> [contents:...string]',
			usageDelim: ' '
		});
	}

	public async add(msg, [tag, contents]) {
		// Check if it is an acceptable tag name
		if (tag.includes('`') || tag.includes('\u200B')) throw msg.language.get('COMMAND_TAGS_NAME_NOTALLOWED');
		if (tag.length > 50) throw msg.language.get('COMMAND_TAGS_NAME_TOOLONG');

		// Lowercase tag name
		tag = tag.toLowerCase();

		const currentTags = msg.guild.settings.tags;
		if (currentTags.has(tag)) throw msg.language.get('COMMAND_TAGS_ADD_EXISTS', tag);
		if (!contents.length) throw msg.language.get('COMMAND_TAGS_CONTENT_REQUIRED');

		currentTags.set(tag, contents);
		const { errors } = await msg.guild.settings.update('_tags', [...currentTags], { action: 'overwrite' });
		if (errors.length) throw errors[0];
		return msg.sendLocale('COMMAND_TAGS_ADD_ADDED', [tag, contents]);
	}

	public async edit(msg, [tag, contents]) {
		tag = tag.toLowerCase();

		const currentTags = msg.guild.settings.tags;
		const oldTag = currentTags.get(tag);
		if (!oldTag) throw msg.language.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', tag);
		if (!contents.length) throw msg.language.get('COMMAND_TAGS_CONTENT_REQUIRED');

		currentTags.set(tag, contents);
		const { errors } = await msg.guild.settings.update('_tags', [...currentTags], { action: 'overwrite' });
		if (errors.length) throw errors[0];
		return msg.sendLocale('COMMAND_TAGS_EDITED', [tag, contents, oldTag]);
	}

	public async remove(msg, [tag]) {
		tag = tag.toLowerCase();

		const currentTags = msg.guild.settings.tags;
		if (!currentTags.has(tag)) throw msg.language.get('COMMAND_TAGS_REMOVE_NOT_EXISTS', tag);
		currentTags.delete(tag);
		const { errors } = await msg.guild.settings.update('_tags', [...currentTags], { action: 'overwrite' });
		if (errors.length) throw errors[0];
		return msg.sendLocale('COMMAND_TAGS_REMOVE_REMOVED', [tag]);
	}

}
