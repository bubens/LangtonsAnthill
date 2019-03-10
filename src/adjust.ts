(function (window, document) {
	function $( query: string ): HTMLElement {
		const element: HTMLElement | null = document.querySelector( query )
		if ( element === null ) {
	    	throw new Error( "Can't get element to query " + query );
		}
		else {
		    return element;
		}
	}

	const width  = window.innerWidth;
	const height = window.innerHeight;

	const canvasWidth = width - 10 - 3 - 3 - 10 - 400 - 10;
	const canvasHeight = height - 50 - 3 - 3 - 50;

	const controlsPosLeft = 10 + 3 + canvasWidth + 10 ;

	const anthill = <HTMLCanvasElement>$( "#layer1-anthill" );
	const antdropper = <HTMLCanvasElement>$( "#layer2-antdropper" );
	
	anthill.width = canvasWidth;
	anthill.height = canvasHeight;
	antdropper.width = canvasWidth;
	antdropper.height = canvasHeight;
	$( "#sidebar" ).style.left = controlsPosLeft + "px";
	$( "#sidebar" ).style.height = canvasHeight + "px";
	//$( "#fps" ).style.top = (height - 50) + "px";


}(window, document));