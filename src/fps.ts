
interface FPS {
  frames : number
  , updated : number
  , logger : (s :string)=>any
}

const Fps = (function () {

	function create( logger: (s:string)=>any ): FPS { 
    	return	{ frames: 0
    			, updated: Date.now()
    			, logger: logger
    	};
	}

	function update( fps: FPS ): FPS {
		let {frames, updated, logger} = fps;
		const delta = Date.now() - updated;
		if ( delta < 1000 ) {
			frames += 1;
		}
		else {
			logger(frames+"FPS")
			updated = Date.now();
			frames = 0;
		}
		return {frames, updated, logger};
	}

	return { create, update };


}());