(function ( window, undefined ) {
// Config
interface Config {
  states: number
  ; width: number
  ; height: number
  ; cellwidth: number
  ; numberOfAnts: number
  ; parentID: string
}

const config: Config = {
  states: 255
  , width: innerWidth
  , height: innerHeight
  , cellwidth: 2
  , numberOfAnts: 1
  , parentID: "anthill"
};

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


// Main controll
function loop( anthill: Anthill, ants: Ant[], cellwidth: number, context: CanvasRenderingContext2D, gradient: Gradient ): void {
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

  window.requestAnimationFrame( () => loop( anthill, ants, cellwidth, context, gradient ) );
}

function main( config: Config ): void {
  const { cellwidth, states, numberOfAnts, parentID } = config;
  const width: number = Math.floor( config.width / cellwidth );
  const height: number = Math.floor( config.height / cellwidth );
  const anthill: Anthill = createAnthill( width, height, states );
  const ants: Ant[] = createAnts( numberOfAnts, states, width, height );
  const gradient: Gradient = calcGradient( states );
  const parent: HTMLElement | null = document.getElementById( parentID );
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  const context: CanvasRenderingContext2D | null = canvas.getContext( "2d" );

  canvas.width = width * cellwidth;
  canvas.height = height * cellwidth;
  canvas.id = parentID + "_canvas";

  if ( parent !== null ) {
    parent.appendChild(canvas);
  }
  else {
    throw new Error( "No parent-element with ID '" + parentID + "'" );
  }

  if ( context === null ) {
    throw new Error( "Can't get rendering context for element " + canvas );
  }

  canvas.addEventListener(
    "mousedown"
    , function (event: MouseEvent): Boolean {
        anttrap.push(
          createAnt(
            {x:Math.floor(event.x/cellwidth), y:Math.floor(event.y/cellwidth)}
            , generateRule(states)
            , randomOrientation()
          )
        );
        event.preventDefault();
        return false;
    }
  );

  requestAnimationFrame( () => loop( anthill, ants, cellwidth, context, gradient ) );
}

main( config );
}( window ));
