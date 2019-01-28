const startAnthill = 
(function ( window: Window, undefined ) {
interface Config {
  states: number
  ; width: number
  ; height: number
  ; cellwidth: number
  ; numberOfAnts: number
  ; parentID: string
}

// Misc/util
type Anttrap = Ant[];
const anttrap: Anttrap = [];

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

interface Coords {
  x: number
  ; y: number
}

interface Ant {
  coords: Coords
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

function generateRule( l:number ): Rule {
  return Array(l).fill(0).map(randomDirection);
}

function createAnt( coords: Coords, rule: Rule, orientation:Orientation ): Ant {
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

function createCoords( x: number, y: number ): Coords {
  return { x, y };
}

function drawAnt( coords: Coords, color: string, cellwidth: number, context: CanvasRenderingContext2D ): void {
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

function calcNewCoords( curCoords: Coords, orientation: Orientation, width: number, height:number ): Coords {
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
  position: Coords
  , radius : number
}

function createAntthrower( position: Coords, radius: number ): Antthrower {
  return { position, radius };
}

const antthrowerCurrentPosition: Coords = {
  x : 0
  , y : 0
 };

function getCurrentPosition(): Coords {
  return antthrowerCurrentPosition;
}




function getDrawingContext( element: HTMLCanvasElement ): CanvasRenderingContext2D {
  const context: CanvasRenderingContext2D | null = element.getContext( "2d" );

  if ( context === null ) {
    throw new Error( "Can't get rendering context for element " + element );
  }
  return context;
}

function getElementByQuery( query: string ): HTMLElement {
  const element: HTMLElement | null = document.querySelector( query )

  if ( element === null ) {
    throw new Error( "Can't get element to query " + query );
  }
  return element;
}

interface FPS {
  frames : number
  , updated : number
  , element : HTMLElement
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
    const newCoords: Coords = calcNewCoords( ant.coords, newOrientation, anthill.width, anthill.height);

    anthill = setState( ant.coords.x, ant.coords.y, anthill, ( state + 1 ) % anthill.maxStates );

    drawAnt( newCoords, "rgb(255,0,0)", cellwidth, context );
    drawAnt( ant.coords, gradient[state], cellwidth, context );

    return createAnt( newCoords, ant.rule, newOrientation );
  });

  if ( Date.now() - fps.updated >= 1000 ) {
    fps.element.innerHTML = fps.frames + "";
    fps.updated = Date.now();
    fps.frames = 0;
  }
  else {
    fps.frames += 1;
  }

  window.requestAnimationFrame( () => loop( anthill, ants, cellwidth, context, gradient, fps ) );
}




function main( config: Config ): void {
  const { cellwidth, states, numberOfAnts, parentID } = config;

  const width = Math.floor( config.width / cellwidth );
  const height = Math.floor( config.height / cellwidth );

  const anthill: Anthill = createAnthill( width, height, states );
  const ants: Ant[] = createAnts( numberOfAnts, states, width, height );

  const gradient: Gradient = calcGradient( states );

  const parent: HTMLElement = getElementByQuery( "#" + parentID );

  
  const guiLayer: HTMLCanvasElement = document.createElement("canvas");
  const guiContext: CanvasRenderingContext2D = getDrawingContext( guiLayer );

  const anthillLayer: HTMLCanvasElement = document.createElement("canvas");
  const anthillContext: CanvasRenderingContext2D = getDrawingContext( anthillLayer );

  const antthrower = createAntthrower( createCoords(0, 0), 20 );

  const fps: FPS = 
    { frames: 0
    , updated: Date.now()
    , element : getElementByQuery( "#fps span" ) };


  anthillLayer.width = width * cellwidth;
  anthillLayer.height = height * cellwidth;
  anthillLayer.id = parentID + "_anthillLayer";

  guiLayer.width = width * cellwidth;
  guiLayer.height = height * cellwidth;
  guiLayer.id = parentID + "_guiLayer";



  parent.appendChild(anthillLayer);
  parent.appendChild(guiLayer);

  guiLayer.addEventListener(
    "mousedown"
    , function (event: MouseEvent): Boolean {
        anttrap.push(
          createAnt(
            {
              x : Math.floor(event.offsetX/cellwidth),
              y: Math.floor(event.offsetY/cellwidth)
            }
            , generateRule(states)
            , randomOrientation()
          )
        );
        event.preventDefault();
        return false;
    }
  );

  guiLayer.addEventListener(
    "mousemove"
    , function (event: MouseEvent): Boolean {
      guiContext.clearRect( 0, 0, width*cellwidth, height*cellwidth );
      guiContext.beginPath();
      guiContext.arc( event.offsetX, event.offsetY, 20, 0, Math.PI*2 );
      guiContext.stroke();
      return false;
    }
  );

  requestAnimationFrame( () => loop( anthill, ants, cellwidth, anthillContext, gradient, fps ) );
}

return main;
}( window ));
