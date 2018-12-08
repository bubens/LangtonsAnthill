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
  return [
    ...Array.from(
      Array( states-1 )
      , (_v, i) => Math.floor( 255 / (states-1) ) * i
    )
    , 255
  ]
  .map(
    (v) => "rgb(%C,%C,%C)".replace(/\%C/g, v+"")
  )
  .reverse();
}

function randomInt( min: number, max: number ): number {
  return min + Math.floor( Math.random() * (max-min) );
}

// BEGIN Ant
interface Coords {
  x: number
  ; y: number
}

interface Ant {
  coords: Coords
  ; orientation: number
  ; rule: number[]
}

function createAnt( coords: Coords, rule: number[], orientation:number ): Ant {
  return {
    coords: coords
    , rule: rule // 0 = right, 1 = left
    , orientation: orientation // 0 = up, 1 = right, 2 = down, 3 = left
  };
}

function createAnts( numberOfAnts: number, states: number, width: number, height: number ) {
  return Array.from(
    Array(numberOfAnts)
    , () => createAnt(
        createCoords( randomInt(0, width), randomInt(0,height) )
        , generateRule( states )
        , 0
      )
  );
}

function drawAnt( coords: Coords, color: string, cellwidth: number, context: CanvasRenderingContext2D ): void {
  context.fillStyle = color;
  context.fillRect( coords.x * cellwidth, coords.y * cellwidth, cellwidth, cellwidth );
}

function generateRule( l:number ): number[] {
  return Array.from(
    Array( l )
    , () => Math.floor( Math.random() + .5 )
  );
}

function createCoords( x: number, y: number ): Coords {
  return {
    x: x
    , y: y
  };
}

function calcNewOrientation( curOrientation: number, direction: number ): number {
  if ( direction === 0 ) {
    return (curOrientation + 1) % 4
  }
  if ( direction === 1 ) {
    return (curOrientation-1 < 0) ? 3 : curOrientation-1;
  }
  throw new Error( "Unknown direction: " + direction );
}

function calcNewCoords( curCoords: Coords, orientation: number, width: number, height:number ): Coords {
  if ( orientation === 0 ) {
    return createCoords( curCoords.x, (curCoords.y + 1) % height );
  }
  else if ( orientation === 1 ) {
    return createCoords( (curCoords.x + 1) % width, curCoords.y );
  }
  else if ( orientation === 2 ) {
    return createCoords( curCoords.x, (curCoords.y-1 < 0) ? height-1 : curCoords.y-1 );
  }
  else if ( orientation === 3 ) {
    return createCoords( (curCoords.x-1 < 0) ? width-1 : curCoords.x-1, curCoords.y );
  }
  throw new Error( "Unknown orientation: " + orientation );
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
  ants = ants.map( ( ant: Ant, index: number ) => {
    const state: number = getState( ant.coords.x, ant.coords.y, anthill );
    const direction: number = ant.rule[ state ];

    const newOrientation: number = calcNewOrientation( ant.orientation, direction );
    const newCoords: Coords = calcNewCoords( ant.coords, newOrientation, anthill.width, anthill.height);

    anthill = setState( ant.coords.x, ant.coords.y, anthill, ( state + 1 ) % anthill.maxStates );

    drawAnt( newCoords, "rgb(255,0,0)", cellwidth, context );
    drawAnt( ant.coords, gradient[state], cellwidth, context );

    return createAnt( newCoords, ant.rule, newOrientation );
  });

  window.requestAnimationFrame( () => loop( anthill, ants, cellwidth, context, gradient ) );
}

function main( config: Config ): void {
  const { cellwidth, states, numberOfAnts, parentID } = config,
  width: number = Math.floor( config.width / cellwidth ),
  height: number = Math.floor( config.height / cellwidth ),
  anthill: Anthill = createAnthill( width, height, states ),
  ants: Ant[] = createAnts( numberOfAnts, states, width, height ),
  gradient: Gradient = calcGradient( states ),
  parent: HTMLElement | null = document.getElementById( parentID ),
  canvas: HTMLCanvasElement = document.createElement("canvas"),
  context: CanvasRenderingContext2D | null = canvas.getContext( "2d" );

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
            , randomInt(0,3+1)
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
