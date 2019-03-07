export const random = 
	(generator: ()=>number = Math.random):number =>
		generator();


export const randomInt = 
	(min: number, max: number, generator: ()=>number = random ): number =>
		min + Math.floor( generator() * (max-min+1) );
