import { Serializer } from '@lib/database';

export default class UserSerializer extends Serializer {
	public async validate(data, { entry, language }) {
		let user = this.client.users.resolve(data);
		if (user) return user;
		if (this.constructor.regex.userOrMember.test(data))
			user = await this.client.users.fetch(this.constructor.regex.userOrMember.exec(data)[1]).catch(() => null);
		if (user) return user;
		throw language.get('resolverInvalidUser', { name: entry.key });
	}

	public serialize(value) {
		return value.id;
	}

	public stringify(value) {
		return (
			this.client.users.cache.get(value) || {
				username: (value && value.username) || value
			}
		).username;
	}
}
