/// <reference path="../../index.d.ts" />

class LongLivingReactionCollector {

	constructor(client, listener) {
		/** @type {SKYRA.Skyra} */
		this.client = client;
		this.listener = listener;
		this._timer = null;
		this.client.llrCollectors.add(this);
	}

	get ended() {
		return this.client.llrCollectors.has(this);
	}

	send(reaction, user) {
		this.listener(reaction, user);
	}

	setTime(time) {
		if (this._timer) clearTimeout(this._timer);
		this.timer = setTimeout(() => this.end(), time);
		return this;
	}

	end() {
		this.client.llrCollectors.delete(this);
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
		return this;
	}

}

module.exports = LongLivingReactionCollector;
