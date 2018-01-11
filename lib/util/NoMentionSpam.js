/**
 * The NoMentionSpam 3.1.0 class that manages the mention cooldowns and such
 * @since 2.1.0
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
	 * @since 2.1.0
	 * @param {string} userID The user id to get
	 * @param {boolean} [create] Whether this call should add a new entry
	 * @returns {NoMentionSpamEntry}
	 */
	get(userID, create = false) {
		const cooldown = super.get(userID);
		if (cooldown) return cooldown;
		if (!create) return null;

		const newCooldown = { id: userID, amount: 0, timeout: null };
		super.set(userID, newCooldown);
		return newCooldown;
	}

	/**
	 * Add an entry to the cache if it does not exist, and add points
	 * @since 2.1.0
	 * @param {string} userID The user id to add
	 * @param {number} amount The amount of points to add
	 * @returns {number}
	 */
	add(userID, amount) {
		const entry = this.get(userID, true);
		entry.amount += amount;
		this._timeout(entry);
		return entry.amount;
	}

	/**
	 * Delete an entry from the cache and clears the timeout if exists
	 * @since 2.1.0
	 * @param {string} userID The user id to delete
	 */
	delete(userID) {
		const entry = super.get(userID);
		if (!entry) return;

		clearTimeout(entry.timeout);
		super.delete(userID);
	}

	/**
	 * Override to clear the timeouts for each member
	 * @since 3.0.0
	 * @returns {void}
	 */
	clear() {
		// Clear all timeouts
		for (const entry of this.values())
			clearTimeout(entry.timeout);

		// Clear all entries
		return super.clear();
	}

	/**
	 * Clear the timeout and re-add it
	 * @since 3.0.0
	 * @param {NoMentionSpamEntry} entry The entry to update
	 * @private
	 */
	_timeout(entry) {
		clearTimeout(entry.timeout);
		entry.timeout = setTimeout(() => this.delete(entry.id), (entry.amount + 4) * 1000);
	}

}

module.exports = NoMentionSpam;
