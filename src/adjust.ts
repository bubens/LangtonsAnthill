(function (window, document, $, undefined) {
	const width  = window.innerWidth;
	const height = window.innerHeight;

	const canvasWidth = width - 10 - 3 - 3 - 10 - 400 - 10;
	const canvasHeight = height - 50 - 3 - 3 - 50;

	const controlsPosLeft = 10 + 3 + canvasWidth + 10 ;
	console.log( controlsPosLeft );

	//$("canvas").width = canvasWidth;
	$( "#layer1-anthill" ).width = canvasWidth;
	$( "#layer1-anthill" ).height = canvasHeight;
	$( "#layer2-antdropper" ).width = canvasWidth;
	$( "#layer2-antdropper" ).height = canvasHeight;
	$( "#controls" ).style.left = controlsPosLeft + "px";
	$( "#controls" ).style.height = canvasHeight + "px";
	$( "#fps" ).style.top = (height - 50) + "px"



}(window, document, getElementByQuery));