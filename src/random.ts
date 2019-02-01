// Random-PMM (Poor man's module)
const Random = (function (Math) {
	const random = (generator:()=>number=Math.random):number =>
		generator();


	const randomInt = (min: number, max: number, generator:()=>number=random ): number =>
		min + Math.floor( generator() * (max-min+1) );

	return { random, randomInt };
}(Math));
