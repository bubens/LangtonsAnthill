import * as Util from "./util";

export interface Layer {
	element: HTMLCanvasElement
	, context: CanvasRenderingContext2D
}



export function draw( fn:(c:CanvasRenderingContext2D)=>void, layer: Layer ):Layer {
	fn( layer.context );
	return layer;
}

export function create(query: string): Layer {
	const element = <HTMLCanvasElement>Util.getElementByQuery(query);
	const context: CanvasRenderingContext2D = Util.getDrawingContext(element);
	return { element, context };
}


