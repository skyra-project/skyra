class Canvas {

	static fillRoundRect(ctx, x, y, width, height, radius = 5) {
		if (width > 0 && height > 0) {
			radius = Math.min(radius, width / 2, height / 2);
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
			ctx.fill();
		}
	}

	static roundImage(ctx, image, x, y, radius) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, false);
		ctx.clip();
		image.onload = () => ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
		ctx.restore();
	}

}
module.exports = Canvas;
