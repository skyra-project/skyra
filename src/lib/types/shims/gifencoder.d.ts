declare module 'gifencoder' {
	class GIFEncoder {
		public constructor(width: number, height: number);
		public createReadStream(): NodeJS.ReadableStream;
		public start(): void;
		public finish(): void;
		public setRepeat(repeat: -1 | 0): void;
		public setDelay(delay: number): void;
		public setQuality(quality: number): void;
		public addFrame(context: CanvasRenderingContext2D): void;
	}

	export = GIFEncoder;
}
