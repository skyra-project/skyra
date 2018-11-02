/// <reference path="../../index.d.ts" />

class LongLivingReactionCollector {

	constructor(client, listener = null, endListener = null) {
		/** @type {SKYRA.Skyra} */
		this.client = client;
		this.listener = listener;
		this.endListener = endListener;
		this._timer = null;
		this.client.llrCollectors.add(this);
	}

	setListener(listener) {
		this.listener = listener;
		return this;
	}

	setEndListener(listener) {
		this.endListener = listener;
		return this;
	}

	get ended() {
		return this.client.llrCollectors.has(this);
	}

	send(reaction, user) {
		this.listener(reaction, user);
	}

	setTime(time) {
		if (this._timer) clearTimeout(this._timer);
		this._timer = setTimeout(() => this.end(), time);
		return this;
	}

	end() {
		if (!this.client.llrCollectors.delete(this)) return this;

		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
		if (this.endListener) {
			process.nextTick(this.endListener.bind(null));
			this.endListener = null;
		}
		return this;
	}

}

module.exports = LongLivingReactionCollector;
