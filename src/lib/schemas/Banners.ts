import { Schema } from 'klasa';

const BannerSchema = new Schema()
	.add('group', 'string')
	.add('title', 'string')
	.add('author_id', 'string')
	.add('price', 'number');

export { BannerSchema };
