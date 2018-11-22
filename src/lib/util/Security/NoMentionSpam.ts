/**
 * The NoMentionSpam 3.1.0 class that manages the mention cooldowns and such
 * @extends {Map<string, NoMentionSpamEntry>}
 * @version 3.1.0
 */
class NoMentionSpam extends Map {

	/**
	 * @typedef  {Object} NoMentionSpamEntry
	 * @property {string} id
	 * @property {number} amount
	 * @property {NodeJS.Timer} timeout
	 */

	/**
	 * Get an entry from the cache
	 * @param {string} userID The user id to get
	 * @param {boolean} [create] Whether this call should add a new entry
	 * @returns {NoMentionSpamEntry}
	 */
	public get(userID, create = false) {
		const cooldown = super.get(userID);
		if (cooldown) return cooldown;
		if (!create) return null;

		const newCooldown = { id: userID, amount: 0, timeout: null };
		super.set(userID, newCooldown);
		return newCooldown;
	}

	/**
	 * Add an entry to the cache if it does not exist, and add points
	 * @param {string} userID The user id to add
	 * @param {number} amount The amount of points to add
	 * @returns {number}
	 */
	public add(userID, amount) {
		const entry = this.get(userID, true);
		entry.amount += amount;
		this._timeout(entry);
		return entry.amount;
	}

	/**
	 * Delete an entry from the cache and clears the timeout if exists
	 * @param {string} userID The user id to delete
	 * @returns {boolean}
	 */
	public delete(userID) {
		const entry = super.get(userID);
		if (!entry) return false;

		clearTimeout(entry.timeout);
		return super.delete(userID);
	}

	/**
	 * Override to clear the timeouts for each member
	 * @returns {void}
	 */
	public clear() {
		// Clear all timeouts
		for (const entry of this.values())
			clearTimeout(entry.timeout);

		// Clear all entries
		return super.clear();
	}

	/**
	 * Clear the timeout and re-add it
	 * @param {NoMentionSpamEntry} entry The entry to update
	 * @private
	 */
	public _timeout(entry) {
		clearTimeout(entry.timeout);
		entry.timeout = setTimeout(() => this.delete(entry.id), (entry.amount + 4) * 1000);
	}

}

export NoMentionSpam;
