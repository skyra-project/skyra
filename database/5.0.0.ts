/**
 * import { R, RDatum } from 'rethinkdb-ts';
 *
 * export async function migrate(r: R) {
 *
 * 	// Update the schema for the guild settings
 * 	await r.db('Skyra').table('guilds').update((rows: RDatum) => r.expr({}).merge(
 * 		r.branch(rows.hasFields('channels'), { channels: r.expr({}).merge(
 * 			r.branch(rows('channels').hasFields('default'), { farewell: rows('channels')('default'), greeting: rows('channels')('default') }, {}),
 * 			r.branch(rows('channels').hasFields('log'), { 'member-logs': rows('channels')('log') }, {}),
 * 			r.branch(rows('channels').hasFields('messagelogs'), { 'message-logs': rows('channels')('messagelogs') }, {}),
 * 			r.branch(rows('channels').hasFields('nsfwmessagelogs'), { 'nsfw-message-logs': rows('channels')('nsfwmessagelogs') }, {}),
 * 			r.branch(rows('channels').hasFields('modlog'), { 'moderation-logs': rows('channels')('modlog') }, {}),
 * 		)
 * 		}, {}),
 * 		r.branch(rows.hasFields('disabledCommandsChannels').and(rows('disabledCommandsChannels').typeOf().eq('OBJECT')), {
 * 			disabledCommandsChannels: rows('disabledCommandsChannels').keys().map((key) => ({ channel: key, commands: rows('disabledCommandsChannels')(key) }))
 * 		}, {}),
 * 		r.branch(rows.hasFields('selfmod').and(rows('selfmod').hasFields('nmsthreshold', 'nomentionspam')), {
 * 			'no-mention-spam': r.expr({}).merge(
 * 				r.branch(rows('selfmod').hasFields('nomentionspam'), { enabled: rows('selfmod')('nomentionspam') }, {}),
 * 				r.branch(rows('selfmod').hasFields('nmsthreshold'), { mentionsAllowed: rows('selfmod')('nmsthreshold') }, {})
 * 			)
 * 		}, {}),
 * 		r.branch(rows.hasFields('stickyRoles'), {
 * 			stickyRoles: rows('stickyRoles').map((entry) => r.branch(entry.hasFields('id'), { user: entry('id'), roles: entry('roles') }, entry))
 * 		}, {})
 * 	)).run();
 *
 * 	// Create the members table, insert all entries with the new schema, and drop the old localScores
 * 	await r.db('Skyra').tableCreate('members').run();
 * 	await r.db('Skyra').table('members').insert(r.db('Skyra').table('localScores').map((rows: RDatum) => ({
 * 		id: rows('guildID').add('.').add(rows('userID')),
 * 		points: rows('count').default(0)
 * 	})), { conflict: (_, a, b) => a.merge({ points: b('points').add(a('points')) }) }).run();
 * 	await r.db('Skyra').tableDrop('localScores').run();
 *
 * }
 */

export const DEPRECATED = true;
