import { assetsFolder } from '#utils/constants';
import { loadFont } from 'canvas-constructor/napi-rs';
import { join } from 'node:path';

loadFont(join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'), 'RobotoRegular');
loadFont(join(assetsFolder, 'fonts', 'NotoEmoji.ttf'), 'RobotoRegular');
loadFont(join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf'), 'RobotoRegular');
loadFont(join(assetsFolder, 'fonts', 'Roboto-Light.ttf'), 'RobotoLight');
loadFont(join(assetsFolder, 'fonts', 'Family-Friends.ttf'), 'FamilyFriends');
