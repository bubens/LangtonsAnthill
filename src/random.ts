export type Generator<A>= () => A;

export const random = 
	(generator: Generator = Math.random):number =>
		generator();


export const randomInt = 
	(min: number, max: number, generator: Generator<number> = random ): number =>
		min + Math.floor( generator() * (max-min+1) );

export const randomBool =
	( generator: Generator<boolean> = () => randomInt(0,1) === 0 ): boolean =>
		generator();
