const startAnthill = 
(function ( window: Window, undefined ) {
interface Config {
  states: number
  ; cellwidth: number
  ; numberOfAnts: number
}

// Misc/util
type Anttrap = Ant[];
let anttrap: Anttrap = [];

type Gradient = string[];
function calcGradient( states: number ): Gradient {
  return Array(states)
    .fill(0)
    .map( (_,i) => i+1 )
    .map( v => Math.round( v * 255/states ) )
    .map( v => ["rgb(", ",", ",", ")"].join( v+"" ) )
    .reverse();
}

function randomInt( min: number, max: number ): number {
  return min + Math.floor( Math.random() * (max-min+1) );
}

// BEGIN Ant
type Up = 0;
type Right = 1;
type Down = 2;
type Left = 3;

type Direction = Left | Right;
type Orientation = Left | Right | Up | Down;

type Rule = Direction[];

interface CartesianCoords {
  x: number
  ; y: number
}

interface PolarCoords {
  radius: number
  ; angle: number
}

interface Ant {
  coords: CartesianCoords
  ; orientation: Orientation
  ; rule: Rule
}

function randomDirection(): Direction {
  return randomInt(0,1) === 0 ? 1 : 3;
}

function randomOrientation(): Orientation {
  const o = randomInt(0,3);
  switch (o) {
    case 0: return 0;
    case 1: return 1;
    case 2: return 2;
    case 3: return 3;
  }
  return 0;
}

function toRadian( d: number ): number {
  return d / 360 * 2 * Math.PI;
}

function toCartesian( p: PolarCoords ): CartesianCoords {
  const x = p.radius * Math.cos( toRadian(p.angle) );
  const y = p.radius * Math.sin( toRadian(p.angle) );
  return { x, y };
}

function randomPolarCoord( r: number ): PolarCoords {
  const radius = randomInt( 0, r );
  const angle = randomInt( 0, 360 );
  return { radius, angle };
}

function generateRule( l:number ): Rule {
  return Array(l).fill(0).map(randomDirection);
}

function createAnt( coords: CartesianCoords, rule: Rule, orientation:Orientation ): Ant {
  return { coords, rule, orientation };
}

function createAnts( numberOfAnts: number, states: number, width: number, height: number ): Ant[] {
  return Array(numberOfAnts)
    .fill(0)
    .map( () => 
         createAnt(
            createCoords( randomInt(0, width-1), randomInt(0, height-1) )
            , generateRule( states )
            , 0)
    );
}

function createCoords( x: number, y: number ): CartesianCoords {
  return { x, y };
}

function drawAnt( coords: CartesianCoords, color: string, cellwidth: number, context: CanvasRenderingContext2D ): void {
  context.fillStyle = color;
  context.fillRect( coords.x * cellwidth, coords.y * cellwidth, cellwidth, cellwidth );
}

function calcNewOrientation( curOrientation: Orientation, direction: Direction ): Orientation {
  if ( direction === 1 ) {
    switch ( curOrientation ) {
      case 0 : return 1;
      case 1 : return 2;
      case 2 : return 3;
      case 3 : return 0;
    }
  }
  else {
    switch ( curOrientation ) {
      case 0 : return 3;
      case 1 : return 0;
      case 2 : return 1;
      case 3 : return 2;
    }
  }
  return 0;
}

function calcNewCoords( curCoords: CartesianCoords, orientation: Orientation, width: number, height:number ): CartesianCoords {
  switch (orientation) {
    case 0 :
      return createCoords( curCoords.x, (curCoords.y + 1) % height );
    case 1 :
      return createCoords( (curCoords.x + 1) % width, curCoords.y );
    case 2 :
      return createCoords( curCoords.x, (curCoords.y-1 < 0) ? height-1 : curCoords.y-1 );
    case 3 :
      return createCoords( (curCoords.x-1 < 0) ? width-1 : curCoords.x-1, curCoords.y );
  }
}

// BEGINN Anthill
interface Anthill {
  area: Uint8Array
  ; width: number
  ; height: number
  ; maxStates: number
}

function createAnthill( width: number, height: number, maxStates: number ): Anthill {
  return {
    width: width
    , height: height
    , area: new Uint8Array( width * height ).fill(0)
    , maxStates: maxStates
  };
}

function getState( x: number, y: number, anthill: Anthill ): number {
  return anthill.area[ anthill.width * y + x ];
}

function setState( x: number, y: number, anthill: Anthill, state: number): Anthill {
  anthill.area[ anthill.width * y + x ] = state;
  return anthill;
}

// BEGIN Antthrower
interface Antthrower {
  position: CartesianCoords
  , radius : number
  , amount : number
}

function createAntthrower( position: CartesianCoords, radius: number, amount: number ): Antthrower {
  return { position, radius, amount };
}

const antthrowerCurrentPosition: CartesianCoords = {
  x : 0
  , y : 0
 };

function getCurrentPosition(): CartesianCoords {
  return antthrowerCurrentPosition;
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










// Main controll
function loop
  ( anthill: Anthill
  , ants: Ant[]
  , cellwidth: number
  , context: CanvasRenderingContext2D
  , gradient: Gradient
  , fps: FPS ): void {
  // a hack. TODO: find something better.
  if ( anttrap.length > 0 ) {
    ants = [...ants, ...anttrap ];
    anttrap.length = 0;
  }
  ants = ants.map( function ( ant: Ant, index: number ) {
    const state: number = getState( ant.coords.x, ant.coords.y, anthill );
    const direction: Direction = ant.rule[ state ];

    const newOrientation: Orientation = calcNewOrientation( ant.orientation, direction );
    const newCoords: CartesianCoords = calcNewCoords( ant.coords, newOrientation, anthill.width, anthill.height);

    anthill = setState( ant.coords.x, ant.coords.y, anthill, ( state + 1 ) % anthill.maxStates );

    drawAnt( newCoords, "rgb(255,0,0)", cellwidth, context );
    drawAnt( ant.coords, gradient[state], cellwidth, context );

    return createAnt( newCoords, ant.rule, newOrientation );
  });

  window.requestAnimationFrame( 
    () => loop(
      anthill,
      ants,
      cellwidth,
      context,
      gradient,
      Fps.update( fps ) 
      )
    );
}




function main( config: Config ): void {
  const { cellwidth, states, numberOfAnts } = config;

  const width = Math.floor( config.width / cellwidth );
  const height = Math.floor( config.height / cellwidth );

  const anthill: Anthill = createAnthill( width, height, states );
  const ants: Ant[] = createAnts( numberOfAnts, states, width, height );

  const gradient: Gradient = calcGradient( states );

  const parent = <HTMLElement>getElementByQuery( "#" + parentID );

  const layerAntdropper = Layer.create( "#layer2-antdropper" );
  const layerAnthill = Layer.create( "#layer1-anthill" );
  

  const antthrower = createAntthrower( createCoords(0, 0), 20, 1 );

  const fps = Fps.create( s => getElementByQuery( "#fps" ).innerHTML = s );

  layerAnthill.element.width = config.width;
  layerAnthill.element.height =config.height;

  layerAntdropper.element.width = config.width;
  layerAntdropper.element.height = config.height;
 
  layerAntdropper.element.addEventListener(
    "mousedown"
    , function (event: MouseEvent): Boolean {
        event.preventDefault();
        const newAnts =
          Array( antthrower.amount )
            .fill( antthrower.radius )
            .map( 
              r =>
                toCartesian(
                  randomPolarCoord(r)
                )
              )
            .map( 
              coords => 
                ({ x: Math.floor( (coords.x + event.offsetX) / cellwidth )
                 , y: Math.floor( (coords.y + event.offsetY) / cellwidth )})
              )
            .map( 
              coords =>
                createAnt(
                  coords
                  , generateRule(states)
                  , randomOrientation()
                )
              );
        console.log( newAnts );
        console.log(anttrap);


        anttrap = newAnts;
        
        return false;
    }
  );

  const guiRadius = <HTMLInputElement>getElementByQuery( "#radius" );
  const guiRadiusShow = <HTMLElement>getElementByQuery( "#show_radius" );
  guiRadius
    .addEventListener(
      "input"
      , function (event: Event ): Boolean {
        event.preventDefault();
        const x = guiRadius.valueAsNumber;
        guiRadiusShow.innerHTML = "" + x;
        antthrower.radius = x;
        return false;
      }
  );

  const guiAmount = <HTMLInputElement>getElementByQuery( "#amount" );
  const guiAmountShow = <HTMLElement>getElementByQuery( "#show_amount" );
  guiAmount
    .addEventListener(
      "input"
      , function (event: Event): Boolean {
        event.preventDefault();
        const x = guiAmount.valueAsNumber;
        guiAmountShow.innerHTML = "" + x;
        antthrower.amount = x;
        return false;
      }
   );

  layerAntdropper.element.addEventListener(
    "mousemove"
    , function (event: MouseEvent): Boolean {
      layerAntdropper.context.clearRect( 0, 0, width*cellwidth, height*cellwidth );
      layerAntdropper.context.beginPath();
      layerAntdropper.context.arc( event.offsetX, event.offsetY, antthrower.radius, 0, Math.PI*2 );
      layerAntdropper.context.stroke();
      return false;
    }
  );

  requestAnimationFrame( () => loop( anthill, ants, cellwidth, layerAnthill.context, gradient, fps ) );
}

return main;
}( window ));
