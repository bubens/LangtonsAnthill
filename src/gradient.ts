export type Gradient = string[];

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