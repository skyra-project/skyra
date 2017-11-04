const minMaxTypes = ['str', 'string', 'num', 'number', 'float', 'int', 'integer'];

/**
 * Represents a possibility in a usage Tag
 */
class Possible {

	/**
     * @param {string[]} regexResults The regex results from parsing the tag member
     */
	constructor([, name, type = 'literal', min, max]) {
		/**
         * The name of this possible
         * @type {string}
         */
		this.name = name;

		/**
         * The type of this possible
         * @type {string}
         */
		this.type = type.toLowerCase();

		/**
         * The min of this possible
         * @type {?number}
         */
		this.min = minMaxTypes.includes(this.type) && min ? Possible.resolveLimit(min, 'min') : null;

		/**
         * The max of this possible
         * @type {?number}
         */
		this.max = minMaxTypes.includes(this.type) && max ? Possible.resolveLimit(max, 'max') : null;
	}

	/**
     * Resolves a limit
     * @param {string} limit The limit to evaluate
     * @param {string} type The type of limit
     * @returns {number}
     */
	static resolveLimit(limit, type) {
		if (isNaN(limit)) throw `${type} must be a number`;
		const tempMin = parseFloat(limit);
		if (['str', 'string', 'int', 'integer'].includes(type) && tempMin % 1 !== 0) throw `${type} must be an integer for this type.`;
		return tempMin;
	}

}

module.exports = Possible;
