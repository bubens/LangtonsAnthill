export interface Logger {
	frames: number
	, updated: number
	, logger: (s: string) => any
}

export const create = 
	(logger: (s: string) => any): Logger => (
		{ frames: 0
		, updated: Date.now()
		, logger: logger }
	);

export const update = ({ frames, updated, logger }: Logger): Logger => {
	if (Date.now() - updated < 1000) {
		frames = frames + 1;
	}
	else {
		logger(frames + "FPS")
		updated = Date.now();
		frames = 0;
	}
	return { frames, updated, logger };
};