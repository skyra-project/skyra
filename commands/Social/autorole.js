const { Command, Providers: { rethink } } = require('../../index');

/* eslint-disable max-len */
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['autoroles', 'levelrole', 'lvlrole'],
			botPerms: ['MANAGE_ROLES'],
			guildOnly: true,
			permLevel: 3,
			mode: 2,
			cooldown: 10,

			usage: '<list|add|remove|update> [points:integer{0,1000000}] <role:string> [...]',
			usageDelim: ' ',
			description: '(ADM) List or configure the autoroles for a guild.',
			extendedHelp: Command.strip`
                Autoroles? They are roles that are available for everyone, and automatically given when they reach an amound of (local) points, an administrator must configure them throught a setting command.

                ⚙ | ***Explained usage***
                Skyra, autorole list                :: I will show you all the autoroles.
                Skyra, autorole add <amount> <role> :: Add a new autorole.
                Skyra, autorole remove <role>       :: Remove an autorole from the list.
                Skyra, autorole update <role>       :: Changed the required amount of points for an existing autorole.

                = Reminder =
                The current system grants a random amount of points between 4 and 8 points, for each post with a 1 minute cooldown.

                = Examples =
                • Skyra, autorole add 20000 Trusted Member
                    I'll start auto-assigning the role 'Trusted Member' to anyone who has at least 20.000 points (based on local points).
            `
		});
	}

	async run(msg, [action, points = null, ...input], settings, i18n) {
		input = input.length > 0 ? input.join(' ') : null;
		return this[action](msg, points, input, settings, i18n);
	}

	list(msg, points, input, settings, i18n) {
		if (settings.autoroles.length === 0) throw i18n.get('COMMAND_AUTOROLE_LIST_EMPTY');
		return msg.send(settings.autoroles.map((obj) => {
			const role = msg.guild.roles.get(obj.id);
			return role ? `${role.name} (${role.id}):: ${obj.points}` : i18n.get('COMMAND_AUTOROLE_UNKNOWN_ROLE', obj.id);
		}).join('\n'), { code: 'asciidoc' });
	}

	async add(msg, points, input, settings, i18n) {
		if (points === null) throw i18n.get('COMMAND_AUTOROLE_POINTS_REQUIRED');
		if (input === null) throw i18n.get('REQUIRE_ROLE');

		const role = await this.client.handler.search.role(input, msg);
		if (!role) throw i18n.get('REQUIRE_ROLE');

		await rethink.append('guilds', msg.guild.id, 'autoroles', { id: role.id, points });
		await settings.sync();

		settings.autoroles.sort((x, y) => +(x.points > y.points) || +(x.points === y.points) - 1);
		return msg.send(i18n.get('COMMAND_AUTOROLE_ADD', role, points));
	}

	async remove(msg, points, input, settings, i18n) {
		if (input === null) throw i18n.get('REQUIRE_ROLE');

		const role = await this.client.handler.search.role(input, msg)
			.then(output => output || /^(?:<@&)?(\d{17,19})>?$/.test(input)
				? { name: 'Unknown', id: input }
				: null);

		if (role === null) throw i18n.get('REQUIRE_ROLE');
		const retrieved = settings.autoroles.find(ar => ar.id === role.id);

		if (!retrieved) throw i18n.get('COMMAND_AUTOROLE_UPDATE_UNCONFIGURED');

		await rethink.removeFromArrayByID('guilds', msg.guild.id, 'autoroles', role.id);
		await settings.sync();

		return msg.send(i18n.get('COMMAND_AUTOROLE_REMOVE', role, retrieved.points));
	}

	async update(msg, points, input, settings, i18n) {
		if (points === null) throw i18n.get('COMMAND_AUTOROLE_POINTS_REQUIRED');
		if (input === null) throw i18n.get('REQUIRE_ROLE');

		const role = await this.client.handler.search.role(input, msg);
		if (role === null) throw i18n.get('REQUIRE_ROLE');

		const retrieved = settings.autoroles.find(ar => ar.id === role.id);
		if (!retrieved) throw i18n.get('COMMAND_AUTOROLE_UPDATE_UNCONFIGURED');

		await rethink.updateArrayByID('guilds', msg.guild.id, 'autoroles', role.id, { points });
		await settings.sync();

		settings.autoroles.sort((x, y) => +(x.points > y.points) || +(x.points === y.points) - 1);
		return msg.send(i18n.get('COMMAND_AUTOROLE_UPDATE', role, points, retrieved.points));
	}

};
