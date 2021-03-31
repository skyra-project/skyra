import { assetsFolder } from '#utils/constants';
import canvas from 'canvas';
import { join } from 'path';

canvas.registerFont(join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'), { family: 'RobotoRegular' });
canvas.registerFont(join(assetsFolder, 'fonts', 'NotoEmoji.ttf'), { family: 'RobotoRegular' });
canvas.registerFont(join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf'), { family: 'RobotoRegular' });
canvas.registerFont(join(assetsFolder, 'fonts', 'Roboto-Light.ttf'), { family: 'RobotoLight' });
canvas.registerFont(join(assetsFolder, 'fonts', 'Family-Friends.ttf'), { family: 'FamilyFriends' });
