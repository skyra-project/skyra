import { assetsFolder } from '#utils/constants';
import { registerFont } from 'canvas-constructor/skia';
import { join } from 'node:path';

registerFont('RobotoRegular', [
	join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'),
	join(assetsFolder, 'fonts', 'NotoEmoji.ttf'),
	join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf')
]);
registerFont('RobotoLight', [join(assetsFolder, 'fonts', 'Roboto-Light.ttf')]);
registerFont('FamilyFriends', [join(assetsFolder, 'fonts', 'Family-Friends.ttf')]);
