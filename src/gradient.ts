export default class Gradient {
	public readonly gradient : Array<Color>;

	private readonly steps : number;

	constructor ( steps: number ) {
		this.steps = steps;

		this.gradient = 
			Array(steps)
				.fill(0)
				.map( (_,i) => this.toGrey( this.ratioOf255(i+1) ) )
				.reverse();
	}

	public asStrings(): Array<string> {
		return this.gradient.map(
			color => color.asString()
		);
	}

	private toGrey( v:number ): Color {
		return new Color(v,v,v);
	}

	private ratioOf255( v: number ): number {
		return Math.round( v * 255/this.steps );
	}
}

export class Color {
	public readonly r : number;
	public readonly g : number;
	public readonly b : number;
	public readonly alpha : number;

	constructor( r: number, g: number, b: number, a: number=1 ) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.alpha = a;
	}

	public asString(): string {
		return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.alpha + ")";
	}
}