type RawColor = [number, number, number];

/*
const toRange = 
	( _:any, i:number ):number => 
		i+1;

const ratioOf255 = 
	(states: number, v: number):number =>
		Math.round( v * 255/states );

const toGrey =
	(v:number):string => 
		["rgb(", ",", ",", ")"].join( v+"" );


export const create = (states: number): Gradient =>
	Array(states)
    	.fill(0)
    	.map( toRange )
    	.map( v => toGrey( ratioOf255(states, v) )  )
    	.reverse();
*/

const toRGBString = (rawColor: RawColor): string => {
	return "rgb( " + rawColor[0] + ", " + rawColor[1] + ", " + rawColor[2] + ")";
}

const toColor = (state: number): RawColor => {
	const mult = Math.floor(state / 255);
	const diff = state % 255;

	if (mult === 0) {
		return [0,0,diff];
	}
	else if ( mult === 1) {
		return [0, diff, 255-diff];
	}
	else if (mult === 2) {
		return [diff, 255-diff, diff];
	}
	else if (mult === 3) {
		return [255, diff, 255-diff];
	}
	else if (mult === 4) {
		return [255, 255, diff];
	}
	else {
		return [255,255,255];
	}
}
export const getColor = (state: number): string =>
	toRGBString(toColor(state));
