// Coordinates PMM (Poor man's module)
interface CartesianCoords {
  x: number
  ; y: number
}

interface PolarCoords {
  r: number
  ; phi: number
}

const Coords = (function (Math) {
	const createCartesian = (x: number, y: number): CartesianCoords =>
		({x, y});

	const createPolar = (r: number, phi: number): PolarCoords =>
		({r, phi});

	const degreesToRadian = (d: number): number =>
		d / 360 * (2 * Math.PI);

	const radianToDegrees = (r : number): number =>
		r / (2 * Math.PI) * 360;

	const polarToCartesian = ({r, phi}: PolarCoords): CartesianCoords => (
		{ x: r * Math.cos( degreesToRadian(phi) )
		, y: r * Math.sin( degreesToRadian(phi) )
		});

	const cartesianToPolar = ({x, y}: CartesianCoords): PolarCoords => (
		{ r: Math.sqrt( x**2 + y**2 )
		, phi: radianToDegrees( Math.atan( y/x ) )
		});

	return { 
		createCartesian, createPolar
		, degreesToRadian, radianToDegrees
		, polarToCartesian, cartesianToPolar };
}(Math));

