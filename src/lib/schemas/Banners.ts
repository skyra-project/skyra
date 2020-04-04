import { Schema } from 'klasa';

export const BannerSchema = new Schema()
	.add('group', 'String')
	.add('title', 'String')
	.add('author_id', 'User')
	.add('price', 'Number');
