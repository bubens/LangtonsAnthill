interface Layer {
	element : HTMLCanvasElement
	, context : CanvasRenderingContext2D
}

const layer = (function (document) {
	function create( id:string ): Layer {
	  const element: HTMLCanvasElement = <HTMLCanvasElement>getElementByQuery( id );
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

	function getElementByQuery( query: string ): Element {
	  const element: Element | null = document.querySelector( query )

	  if ( element === null ) {
	    throw new Error( "Can't get element to query " + query );
	  }
	  else {
	    return element;
	  }
	}

	return { create, getElementByQuery }
}(document));



