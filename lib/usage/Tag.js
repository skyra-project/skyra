const Possible = require('./Possible');

/**
 * Represents a usage Tag
 */
class Tag {

    /**
	 * @param {string} members The tag contents to parse
	 * @param {number} count The position of the tag in the usage string
	 * @param {boolean} required The type of tag (required or optional)
	 */
    constructor(members, count, required) {
        /**
		 * The type of this tag
		 * @type {string}
		 */
        this.type = required ? 'required' : 'optional';

        /**
		 * The possibilities of this tag
		 * @type {Possible[]}
		 */
        this.possibles = Tag.parseMembers(members, count);
    }

    /**
	 * Parses members into usable possibles
	 * @param {string} members The tag contents to parse
	 * @param {number} count The position of the tag in the usage string
	 * @returns {Possible[]}
	 */
    static parseMembers(members, count) {
        const literals = [];
        const types = [];
        members = members.split('|');
        return members.map((member, i) => {
            const current = `${members}: at tag #${count} at bound #${i + 1}`;
            let possible;
            try {
                possible = new Possible(/^([^:]+)(?::([^{}]+))?(?:{([^,]+)?(?:,(.+))?})?$/i.exec(member));
            } catch (err) {
                if (typeof err === 'string') throw `${current}: ${err}`;
                throw `${current}: invalid syntax, non specific`;
            }
            if (possible.type === 'literal') {
                if (literals.includes(possible.name)) throw `${current}: there can't be two literals with the same text.`;
                literals.push(possible.name);
            } else if (members.length > 1) {
                if (['str', 'string'].includes(possible.type) && members.length - 1 !== i) throw `${current}: the String type is vague, you must specify it at the last bound`;
                if (types.includes(possible.type)) throw `${current}: there can't be two bounds with the same type (${possible.type})`;
                types.push(possible.type);
            }
            return possible;
        });
    }

}

module.exports = Tag;
