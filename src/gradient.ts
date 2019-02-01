// Gradient PMM (Poor man's module)
type Gradient = string[];

const Gradient = (function (Array, Math) {
	
	const create = (states: number): Gradient =>
		Array(states)
	    	.fill(0)
	    	.map( (_,i) => i+1 )
	    	.map( v => Math.round( v * 255/states ) )
	    	.map( v => ["rgb(", ",", ",", ")"].join( v+"" ) )
	    	.reverse();

	return { create };
}(Array, Math));