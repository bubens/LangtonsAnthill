function getElementByQuery( query: string ): Element {
	const element: Element | null = document.querySelector( query )
	if ( element === null ) {
    	throw new Error( "Can't get element to query " + query );
	}
	else {
	    return element;
	}
}