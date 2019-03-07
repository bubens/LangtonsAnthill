import * as Coords from "./coords";
import * as Random from "./random";
import * as Gradient from "./gradient";
import * as Fps from "./fps-log";
import * as Layer from "./layer";

interface Config {
  states: number
  ; cellwidth: number
  ; numberOfAnts: number
  ; anthillID: string
  ; antdropperID: string
}

// Misc/util
type Anttrap = Ant[];
let anttrap: Anttrap = [];


// BEGIN Ant
type Up = 0;
type Right = 1;
type Down = 2;
type Left = 3;

type Direction = Left | Right;
type Orientation = Left | Right | Up | Down;

type Rule = Array<Direction>;




// BEGIN Ant
interface Ant {
  coords: Coords.Cartesian
  ; orientation: Orientation
  ; rule: Rule
}

function randomDirection(generator?: () => number): Direction {
  return Random.randomInt(0, 1, generator) === 0 ? 1 : 3;
}

function randomOrientation(generator?: () => number): Orientation {
  const o = Random.randomInt(0, 3, generator);
  switch (o) {
    case 0: return 0;
    case 1: return 1;
    case 2: return 2;
    case 3: return 3;
  }
  return 0;
}

function randomPolarCoord(r: number): Coords.Polar {
  return Coords.createPolar(
    Random.randomInt(0, r)
    , Random.randomInt(0, 360));
}

function generateRule(l: number): Rule {
  return Array(l).fill(0).map(() => randomDirection());
}

function createAnt(coords: Coords.Cartesian, rule: Rule, orientation: Orientation): Ant {
  return { coords, rule, orientation };
}

function createAnts(numberOfAnts: number, states: number, width: number, height: number): Ant[] {
  return Array(numberOfAnts)
    .fill(0)
    .map(() =>
      createAnt(
        Coords.createCartesian(Random.randomInt(0, width - 1), Random.randomInt(0, height - 1))
        , generateRule(states)
        , 0)
    );
}

function drawAnt(coords: Coords.Cartesian, color: string, cellwidth: number, context: CanvasRenderingContext2D): void {
  context.fillStyle = color;
  context.fillRect(coords.x * cellwidth, coords.y * cellwidth, cellwidth, cellwidth);
}

function calcNewOrientation(curOrientation: Orientation, direction: Direction): Orientation {
  if (direction === 1) {
    switch (curOrientation) {
      case 0: return 1;
      case 1: return 2;
      case 2: return 3;
      case 3: return 0;
    }
  }
  else {
    switch (curOrientation) {
      case 0: return 3;
      case 1: return 0;
      case 2: return 1;
      case 3: return 2;
    }
  }
  return 0;
}

function calcNewCoords(curCoords: Coords.Cartesian, orientation: Orientation, width: number, height: number): Coords.Cartesian {
  switch (orientation) {
    case 0:
      return Coords.createCartesian(
        curCoords.x
        , (curCoords.y + 1) % height
      );
    case 1:
      return Coords.createCartesian(
        (curCoords.x + 1) % width
        , curCoords.y
      );
    case 2:
      return Coords.createCartesian(
        curCoords.x
        , (curCoords.y - 1 < 0) ? height - 1 : curCoords.y - 1
      );
    case 3:
      return Coords.createCartesian(
        (curCoords.x - 1 < 0) ? width - 1 : curCoords.x - 1
        , curCoords.y
      );
  }
}




// BEGINN Anthill
interface Anthill {
  area: Uint8Array
  ; width: number
  ; height: number
  ; maxStates: number
}

function createAnthill(width: number, height: number, maxStates: number): Anthill {
  return {
    width: width
    , height: height
    , area: new Uint8Array(width * height).fill(0)
    , maxStates: maxStates
  };
}

function getState(x: number, y: number, anthill: Anthill): number {
  return anthill.area[anthill.width * y + x];
}

function setState(x: number, y: number, anthill: Anthill, state: number): Anthill {
  anthill.area[anthill.width * y + x] = state;
  return anthill;
}




// BEGIN Antdropper
interface Antdropper {
  radius: number
  , amount: number
}

function createAntdropper(radius: number, amount: number): Antdropper {
  return { radius, amount };
}


// OTHER Util
function getElementByQuery(query: string): Element {
  const element: Element | null = document.querySelector(query)
  if (element === null) {
    throw new Error("Can't get element to query " + query);
  }
  else {
    return element;
  }
}




// Main controll
function loop
  (anthill: Anthill
    , ants: Ant[]
    , cellwidth: number
    , context: CanvasRenderingContext2D
    , gradient: Gradient.Gradient
    , fps: Fps.Logger): void {


  // a hack. TODO: find something better.
  if (anttrap.length > 0) {
    ants = [...ants, ...anttrap];
    anttrap.length = 0;
  }

  ants = ants.map(function (ant: Ant) {
    const state: number = getState(ant.coords.x, ant.coords.y, anthill);
    const direction: Direction = ant.rule[state];

    const newOrientation: Orientation = calcNewOrientation(ant.orientation, direction);
    const newCoords: Coords.Cartesian = calcNewCoords(ant.coords, newOrientation, anthill.width, anthill.height);

    anthill = setState(ant.coords.x, ant.coords.y, anthill, (state + 1) % anthill.maxStates);

    drawAnt(newCoords, "rgb(255,0,0)", cellwidth, context);
    drawAnt(ant.coords, gradient[state], cellwidth, context);

    return createAnt(newCoords, ant.rule, newOrientation);
  });

  window.requestAnimationFrame(
    () => loop(
      anthill,
      ants,
      cellwidth,
      context,
      gradient,
      Fps.update(fps)
    )
  );
}

export function main(config: Config): void {
  const { cellwidth, states, numberOfAnts } = config;

  const layerAntdropper = Layer.create("#layer2-antdropper");
  const layerAnthill = Layer.create("#layer1-anthill");

  const w = Math.floor(layerAnthill.element.width / cellwidth),
    h = Math.floor(layerAnthill.element.height / cellwidth);

  const anthill = createAnthill(w, h, states);
  const ants = createAnts(numberOfAnts, states, w, h);

  const gradient = Gradient.create(states);



  const antthrower = createAntdropper(20, 1);

  const fps = Fps.create(s => getElementByQuery("#fps").innerHTML = s);

  layerAntdropper.element.addEventListener(
    "mousedown"
    , function (event: MouseEvent): Boolean {
      event.preventDefault();
      const newAnts =
        Array(antthrower.amount)
          .fill(antthrower.radius)
          .map(
            r =>
              Coords.polarToCartesian(
                randomPolarCoord(r)
              )
          )
          .map(
            coords =>
              Coords.createCartesian(
                Math.floor((coords.x + event.offsetX) / cellwidth)
                , Math.floor((coords.y + event.offsetY) / cellwidth)
              )
          )
          .map(
            coords =>
              createAnt(
                coords
                , generateRule(states)
                , randomOrientation()
              )
          );


      anttrap = newAnts;

      return false;
    }
  );

  const guiRadius = <HTMLInputElement>getElementByQuery("#radius");
  const guiRadiusShow = <HTMLElement>getElementByQuery("#show_radius");
  guiRadius
    .addEventListener(
      "input"
      , function (event: Event): Boolean {
        event.preventDefault();
        const x = guiRadius.valueAsNumber;
        guiRadiusShow.innerHTML = "" + x;
        antthrower.radius = x;
        return false;
      }
    );

  const guiAmount = <HTMLInputElement>getElementByQuery("#amount");
  const guiAmountShow = <HTMLElement>getElementByQuery("#show_amount");
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
      layerAntdropper.context.clearRect(0, 0, 9999, 9999);
      layerAntdropper.context.beginPath();
      layerAntdropper.context.arc(event.offsetX, event.offsetY, antthrower.radius, 0, Math.PI * 2);
      layerAntdropper.context.stroke();
      return false;
    }
  );

  requestAnimationFrame(() => loop(anthill, ants, cellwidth, layerAnthill.context, gradient, fps));
}

main({
  states: 255
  , cellwidth : 2
  , numberOfAnts : 0
  , anthillID: "#layer1-anthill"
  , antdropperID: "#layer2-antdropper"
});
