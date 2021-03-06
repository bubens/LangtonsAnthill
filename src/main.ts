import * as Util from "./util";
import * as Coords from "./coords";
import * as Random from "./random";
import * as Gradient from "./gradient";
import * as Stats from "./stats";
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

function drawAnt(coords: Coords.Cartesian, color: string, cellwidth: number): (c: CanvasRenderingContext2D) => void {
  return function (context) {
    context.fillStyle = color;
    context.fillRect(coords.x * cellwidth, coords.y * cellwidth, cellwidth, cellwidth);
  }
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

interface State {
  cellwidth: number
  , layer: Layer.Layer
  , gradient: Gradient.Gradient
}

let DRAW_ANTS: boolean = true;

function loop(ants: Array<Ant>, anthill: Anthill, fpsStats: Stats.Stat, antStats: Stats.Stat, consts: State): void {
  //const { cellwidth, layer, gradient } = state;


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

    // TODO: no!
    if (DRAW_ANTS) {
      Layer.draw(drawAnt(newCoords, "rgb(255,0,0)", consts.cellwidth), consts.layer);
    }
    Layer.draw(drawAnt(ant.coords, consts.gradient[state], consts.cellwidth), consts.layer);

    return createAnt(newCoords, ant.rule, newOrientation);
  });

  fpsStats =
    Util.pipe(fpsStats)
      (Stats.onUpdate(s => { s.stat += 1; return s; })
        , Stats.onInterval(s => { s.log(s.stat); s.stat = 0; return s; })
      );

  antStats = Stats.onInterval(s => { s.log(ants.length + ""); return s; })(antStats);

  window.requestAnimationFrame(
    (t) =>
      loop(ants, anthill, fpsStats, antStats, consts)
  );
}





export function main(config: Config): void {
  const { cellwidth, states, numberOfAnts } = config;


  const layerAnthill = Layer.create("#layer1-anthill", { alpha: false });

  const w = Math.floor(layerAnthill.element.width / cellwidth),
    h = Math.floor(layerAnthill.element.height / cellwidth);


  const ants = createAnts(numberOfAnts, states, w, h);

  const anthill = createAnthill(w, h, states);



  const layerAntdropper = Layer.create("#layer2-antdropper");
  const antdropper = createAntdropper(20, 1);
  layerAntdropper.element.addEventListener(
    "mousedown"
    , function (event: MouseEvent): Boolean {
      event.preventDefault();
      const newAnts =
        Array(antdropper.amount)
          .fill(antdropper.radius)
          .map(
            Coords.randomCartesianInRadius
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
  const lastRadius = localStorage.getItem("last_radius");
  if (lastRadius) {
    guiRadius.value = lastRadius;
    guiRadiusShow.innerHTML = lastRadius;
    antdropper.radius = parseInt(lastRadius, 10);
  }
  else {
    guiRadiusShow.innerHTML = "50";
    antdropper.amount = 50;
  }
  guiRadius
    .addEventListener(
      "input"
      , (event: Event): Boolean => {
        event.preventDefault();
        const x = guiRadius.valueAsNumber;
        guiRadiusShow.innerHTML = "" + x;
        antdropper.radius = x;
        localStorage.setItem("last_radius", "" + x);
        return false;
      }
    );

  const guiAmount = <HTMLInputElement>getElementByQuery("#amount");
  const guiAmountShow = <HTMLElement>getElementByQuery("#show_amount");
  const lastAmount = localStorage.getItem("last_amount");
  if (lastAmount) {
    guiAmount.value = lastAmount;
    guiAmountShow.innerHTML = lastAmount;
    antdropper.amount = parseInt(lastAmount, 10);
  }
  else {
    guiAmountShow.innerHTML = "1";
    antdropper.amount = 1;
  }
  guiAmount
    .addEventListener(
      "input"
      , function (event: Event): Boolean {
        event.preventDefault();
        const x = guiAmount.valueAsNumber;
        guiAmountShow.innerHTML = "" + x;
        antdropper.amount = x;
        localStorage.setItem("last_amount", "" + x);
        return false;
      }
    );

  const guiDrawAnts = <HTMLInputElement>getElementByQuery("#drawAnts");
  guiDrawAnts
    .addEventListener(
      "input"
      , function (event: Event): Boolean {
        // uhhh... bad!!!
        DRAW_ANTS = guiDrawAnts.checked;
        return false;
      }
    );

  layerAntdropper.element.addEventListener(
    "mousemove"
    , function (event: MouseEvent): Boolean {
      layerAntdropper.context.clearRect(0, 0, 9999, 9999);
      layerAntdropper.context.beginPath();
      layerAntdropper.context.arc(event.offsetX, event.offsetY, antdropper.radius, 0, Math.PI * 2);
      layerAntdropper.context.stroke();
      return false;
    }
  );


  const gradient = Gradient.create(states);

  const fpsStats = Stats.create(s => getElementByQuery("#stats_fps").innerHTML = s, 1000, 0);
  const antStats = Stats.create(s => getElementByQuery("#stats_ants").innerHTML = s, 1000);

  requestAnimationFrame(
    () =>
      loop(ants, anthill, fpsStats, antStats, { cellwidth, layer: layerAnthill, gradient })
  );
}

main({
  states: 255
  , cellwidth: 2
  , numberOfAnts: 0
  , anthillID: "#layer1-anthill"
  , antdropperID: "#layer2-antdropper"
});
