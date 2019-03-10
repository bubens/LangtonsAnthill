import * as Random from "./random";

export interface Cartesian {
  x: number
  ; y: number
}

export interface Polar {
  r: number
  ; phi: number
}


export const createCartesian = 
	(x: number, y: number): Cartesian =>
		({x, y});

export const createPolar = 
	(r: number, phi: number): Polar =>
		({r, phi});

export const degreesToRadian = 
	(d: number): number =>
		d / 360 * (2 * Math.PI);

export const radianToDegrees = 
	(r : number): number =>
		r / (2 * Math.PI) * 360;

export const polarToCartesian = 
	({r, phi}: Polar): Cartesian => (
		{ x: r * Math.cos( degreesToRadian(phi) )
		, y: r * Math.sin( degreesToRadian(phi) )
		}
	);

export const cartesianToPolar = 
	({x, y}: Cartesian): Polar => (
		{ r: Math.sqrt( x**2 + y**2 )
		, phi: radianToDegrees( Math.atan( y/x ) )
		}
	);

export const randomPolarCoord = (r: number): Polar => 
	createPolar(
		Random.randomInt(0, r)
	  , Random.randomInt(0, 360));

export const randomCartesianInRadius = (r: number): Cartesian =>
	polarToCartesian(
		randomPolarCoord( r )
	);