import { Schema } from 'klasa';

export default new Schema()
	.add('group', 'string')
	.add('title', 'string')
	.add('author_id', 'string')
	.add('price', 'number');
