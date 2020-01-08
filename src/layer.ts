export interface Layer {
	element: HTMLCanvasElement
	, context: CanvasRenderingContext2D
}

interface ContextAttributes {
	alpha?: boolean
	, desynchronized?: boolean
}

function getElementByQuery(query: string): Element {
	const element: Element | null = document.querySelector(query)
	if (element === null) {
		throw new Error("Can't get element to query " + query);
	}
	else {
		return element;
	}
}

function getDrawingContext(element: HTMLCanvasElement, attributes?: ContextAttributes): CanvasRenderingContext2D {
	const context: CanvasRenderingContext2D | null = element.getContext("2d", attributes);

	if (context === null) {
		throw new Error("Can't get rendering context for element " + element);
	}
	else {
		return context;
	}
}

export function draw(fn: (c: CanvasRenderingContext2D) => void, layer: Layer): Layer {
	fn(layer.context);
	return layer;
}

export function create(query: string, attributes?: ContextAttributes): Layer {
	const element = <HTMLCanvasElement>getElementByQuery(query);
	const context: CanvasRenderingContext2D = getDrawingContext(element);
	return { element, context };
}


