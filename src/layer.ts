// Layer-PMM (Poor man's module)
interface Layer {
	element : HTMLCanvasElement
	, context : CanvasRenderingContext2D
}

const Layer = (function (document) {
	function getElementByQuery( query: string ): Element {
		const element: Element | null = document.querySelector( query )
		if ( element === null ) {
	    	throw new Error( "Can't get element to query " + query );
		}
		else {
		    return element;
		}
	}

	function create( query: string ): Layer {
	  const element = <HTMLCanvasElement>getElementByQuery( query );
	  const context: CanvasRenderingContext2D = getDrawingContext( element );
	  return { element, context };
	}


	function getDrawingContext( element: HTMLCanvasElement ): CanvasRenderingContext2D {
	  const context: CanvasRenderingContext2D | null = element.getContext( "2d" );

	  if ( context === null ) {
	    throw new Error( "Can't get rendering context for element " + element );
	  }
	  return context;
	}

	return { create }
}(document));



