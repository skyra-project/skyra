// Copyright (c) 2018 Stanislav Woodger. All rights reserved. MIT license.
// Source: https://github.com/woodger/cookie-httponly

import type { ApiRequest } from './ApiRequest';
import type { ApiResponse } from './ApiResponse';

export class CookieStore extends Map<string, string> {
	protected request: ApiRequest;
	protected response: ApiResponse;
	private domain: string;
	private secure: boolean;

	public constructor(request: ApiRequest, response: ApiResponse, secure: boolean) {
		super();

		this.request = request;
		this.response = response;

		// Read cookies
		const { cookie = '' } = request.headers;
		const pairs = cookie.split(';');

		for (const pair of pairs) {
			const index = pair.indexOf('=');
			if (index === -1) continue;

			const key = decodeURIComponent(pair.substr(0, index).trim());
			const value = decodeURIComponent(pair.substr(index + 1).trim());
			this.set(key, value);
		}

		const [domain] = this.request.headers.host?.split(':') ?? [''];

		// RFC 6265 5.1.3 Domain Matching
		this.domain = domain.toLowerCase();

		if (this.request.socket.remoteAddress === this.domain) {
			throw new Error('The connection must be established from the domain name (i.e., not an IP address)');
		}

		// RFC 6265 4.1.2.5. The Secure Attribute
		this.secure = secure;
	}

	public add(name: string, value: string, options?: SecureCookieStoreSetOptions) {
		this.insert(name, this.prepare(name, value, options));
	}

	protected insert(name: string, entry: string) {
		let set = this.response.getHeader('Set-Cookie');

		if (set === undefined) {
			set = [];
		} else if (!Array.isArray(set)) {
			set = [set.toString()];
		}

		set = set.filter((i) => i.substr(0, i.indexOf('=')) !== name);
		set.push(entry);

		this.response.setHeader('Set-Cookie', set);
	}

	protected prepare(name: string, value: string, { expires, maxAge, domain = this.domain, path = '/' }: SecureCookieStoreSetOptions = {}) {
		const now = new Date();

		if (expires === undefined) {
			expires = now;
		}

		// RFC 6265 4.1.1. Syntax
		name = CookieStore.encodeCookieOctet(name);
		value = CookieStore.encodeCookieOctet(value);

		let entry = `${name}=${value}`;

		if (expires !== now) {
			entry += `; Expires=${expires.toUTCString()}`;
		} else if (maxAge) {
			entry += `; Max-Age=${maxAge}`;
		}

		// RFC 6265 5.1.3 Domain Matching
		domain = domain.toLowerCase();
		if (domain !== this.domain) {
			entry += `; Domain=${domain}`;
		}

		entry += `; Path=${path}`;

		if (this.secure) {
			entry += `; Secure`;
		}

		entry += `; HttpOnly`;

		return entry;
	}

	// RFC 6265 4.1.1. Syntax
	private static readonly kOctetRegExp = /[^\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]/g;

	private static encodeCookieOctet(value: string) {
		if (CookieStore.kOctetRegExp.test(value)) {
			throw new Error(`Invalid character in value`);
		}

		return encodeURIComponent(value);
	}
}

export interface SecureCookieStoreSetOptions {
	expires?: Date;
	maxAge?: number;
	domain?: string;
	path?: string;
}
