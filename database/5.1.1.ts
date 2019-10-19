/**
 * import { R, RDatum } from 'rethinkdb-ts';
 *
 * export async function migrate(r: R) {
 *
 * 	// Update the schema for the guild settings
 * 	await r.db('Skyra').table('guilds').update((rows: RDatum) => r.expr({}).merge(
 * 		r.branch(rows.hasFields('filter'), {
 * 			selfmod: {
 * 				filter: r.expr({}).merge(
 * 					r.branch(rows('filter').hasFields('level'), { enabled: rows('filter')('level').ne(0), softAction: rows('filter')('level') }, {}),
 * 					r.branch(rows('filter').hasFields('raw'), { raw: rows('filter')('raw') }, {})
 * 				)
 * 			}
 * 		}, {}),
 * 		r.branch(rows.hasFields('selfmod'), {
 * 			selfmod: r.expr({}).merge(
 * 				r.branch(rows('selfmod').hasFields('capsfilter'), { capitals: { enabled: rows('selfmod')('capsfilter').ne(0), softAction: rows('selfmod')('capsfilter') } }, {}),
 * 				r.branch(rows('selfmod').hasFields('capsminimum'), { capitals: { minimum: rows('selfmod')('capsminimum') } }, {}),
 * 				r.branch(rows('selfmod').hasFields('capsthreshold'), { capitals: { maximum: rows('selfmod')('capsthreshold') } }, {}),
 * 				r.branch(rows('selfmod').hasFields('invitelinks'), { invites: { enabled: rows('selfmod')('invitelinks') } }, {}),
 * 			)
 * 		}, {})
 * 	)).run();
 *
 * }
 */

export const DEPRECATED = true;
