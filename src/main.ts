import * as Util from "./util";
import * as Coords from "./coords";
import * as Random from "./random";
import * as Gradient from "./gradient";
import * as Stats from "./stats";
import * as Layer from "./layer";

interface Config {
  cellwidth: number
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

const StorageKeys = {
  dropRadius: "drop_radius",
  antsPerClick: "ants_per_click",
  showAnts: "show_ants"
}


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



function generateRule(): Rule {
  return Array(255).fill(0).map(() => randomDirection());
}

function createAnt(coords: Coords.Cartesian, rule: Rule, orientation: Orientation): Ant {
  return { coords, rule, orientation };
}

function initAnts(numberOfAnts: number, width: number, height: number): Ant[] {
  return Array(numberOfAnts)
    .fill(0)
    .map(() =>
      createAnt(
        Coords.createCartesian(Random.randomInt(0, width - 1), Random.randomInt(0, height - 1))
        , generateRule()
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
  area: Uint16Array
  ; width: number
  ; height: number
}

function initAnthill(width: number, height: number): Anthill {
  return {
    width: width
    , height: height
    , area: new Uint16Array(width * height).fill(0)
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

// Create and setup layer with the circle-thingy
function initAntdropper(radius: number, amount: number, cellwidth: number, layer: Layer.Layer): Antdropper {
  const antdropper = { radius, amount };

  layer.element.addEventListener(
    "mousedown"
    , function (event: MouseEvent): Boolean {
      event.preventDefault();
      const newAnts =
        Array(antdropper.amount)
          .fill(antdropper.radius)
          .map(
            (r: number) => {
              const randomCoords = Coords.randomCartesianInRadius(r);
              const coordsWithOffset = Coords.createCartesian(
                Math.floor((randomCoords.x + event.offsetX) / cellwidth)
                , Math.floor((randomCoords.y + event.offsetY) / cellwidth)
              );
              return createAnt(coordsWithOffset, generateRule(), randomOrientation());
            }
          );
      anttrap = newAnts;

      return false;
    }
  );
  return antdropper;
}

function initRadiusSlider(antdropper: Antdropper): HTMLInputElement {
  const slider = <HTMLInputElement>getElementByQuery("#radius");
  const display = <HTMLElement>getElementByQuery("#show_radius");
  const lastRadius = localStorage.getItem(StorageKeys.dropRadius);
  if (lastRadius !== null) {
    const r = parseInt(lastRadius, 10);
    if (!isNaN(r)) {
      slider.value = lastRadius;
      display.innerHTML = lastRadius;
      antdropper.radius = r;
    }
    else {
      slider.value = "50";
      display.innerHTML = "50";
      antdropper.amount = 50;
      localStorage.setItem(StorageKeys.dropRadius, "50");
    }
  }
  else {
    slider.value = "50";
    display.innerHTML = "50";
    antdropper.amount = 50;
    localStorage.setItem(StorageKeys.dropRadius, "50");
  }
  slider
    .addEventListener(
      "input"
      , (event: Event): Boolean => {
        event.preventDefault();
        const x = slider.valueAsNumber;
        display.innerHTML = "" + x;
        antdropper.radius = x;
        localStorage.setItem(StorageKeys.dropRadius, "" + x);
        return false;
      }
    );

  return slider;
}
function initAmountSlider(antdropper: Antdropper): HTMLInputElement {
  const slider = <HTMLInputElement>getElementByQuery("#amount");
  const display = <HTMLElement>getElementByQuery("#show_amount");
  const lastAmount = localStorage.getItem(StorageKeys.antsPerClick);
  if (lastAmount !== null) {
    const n = parseInt(lastAmount, 10);
    if (!isNaN(n)) {
      slider.value = lastAmount;
      display.innerHTML = lastAmount;
      antdropper.amount = parseInt(lastAmount, 10);
    }
    else {
      slider.value = "1";
      display.innerHTML = "1";
      antdropper.amount = 1;
      localStorage.setItem(StorageKeys.antsPerClick, "1");
    }
  }
  else {
    slider.value = "1";
    display.innerHTML = "1";
    antdropper.amount = 1;
    localStorage.setItem(StorageKeys.antsPerClick, "1");
  }
  slider
    .addEventListener(
      "input"
      , function (event: Event): Boolean {
        event.preventDefault();
        const x = slider.valueAsNumber;
        display.innerHTML = "" + x;
        antdropper.amount = x;
        localStorage.setItem(StorageKeys.antsPerClick, "" + x);
        return false;
      }
    );
  return slider;
}

function initDrawAntsCheckbox(): HTMLInputElement {
  const checkbox = <HTMLInputElement>getElementByQuery("#drawAnts");
  const drawAnts = localStorage.getItem("show_ants");
  if (drawAnts === null || drawAnts === "true") {
    checkbox.checked = true;
    localStorage.setItem(StorageKeys.showAnts, "true");
    DRAW_ANTS = true;
  }
  else {
    checkbox.checked = false;
    localStorage.setItem(StorageKeys.showAnts, "false");
    DRAW_ANTS = false;
  }
  checkbox
    .addEventListener(
      "input"
      , function (event: Event): Boolean {
        // uhhh... bad!!!
        DRAW_ANTS = checkbox.checked;
        localStorage.setItem(StorageKeys.showAnts, DRAW_ANTS ? "true" : "false");
        return false;
      }
    );
  return checkbox;
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
}

let DRAW_ANTS: boolean = true;

function loop(ants: Array<Ant>, anthill: Anthill, fpsStats: Stats.Stat, antStats: Stats.Stat, consts: State): void {
  //const { cellwidth, layer, gradient } = state;


  // a hack. TODO: find something better.
  if (anttrap.length > 0) {
    ants = [...ants, ...anttrap];
    anttrap.length = 0;
  }

  for (let i = 0, l = ants.length; i < l; i += 1) {
    let ant = ants[i];
    let state = getState(ant.coords.x, ant.coords.y, anthill);
    let direction = ant.rule[state % 255];

    let newOrientation = calcNewOrientation(ant.orientation, direction);
    let newCoords = calcNewCoords(ant.coords, newOrientation, anthill.width, anthill.width);

    anthill = setState(ant.coords.x, ant.coords.y, anthill, (state + 1));

    if (DRAW_ANTS) {
      Layer.draw(drawAnt(newCoords, "rgb(255,0,0)", consts.cellwidth), consts.layer);
    }
    Layer.draw(drawAnt(ant.coords, Gradient.getColor(state), consts.cellwidth), consts.layer);


    ants[i].coords = newCoords;
    ants[i].orientation = newOrientation;
  }

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
  const { cellwidth, numberOfAnts } = config;

  const layerAnthill = Layer.create("#layer1-anthill", { alpha: false });

  const rawWidth = layerAnthill.element.width,
    rawHeight = layerAnthill.element.height,
    w = Math.floor(rawWidth / cellwidth),
    h = Math.floor(rawHeight / cellwidth);

  Layer.draw(
    ctx => {
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, rawWidth, rawHeight);
    },
    layerAnthill
  );

  const ants = initAnts(numberOfAnts, w, h);

  const anthill = initAnthill(w, h);

  const layerAntdropper = Layer.create("#layer2-antdropper");
  layerAntdropper.context.strokeStyle = "#FFFFFF";

  const antdropper = initAntdropper(20, 1, cellwidth, layerAntdropper);

  const radiusSlider = initRadiusSlider(antdropper);
  const amountSlider = initAmountSlider(antdropper);
  const drawAntsCheckbox = initDrawAntsCheckbox();




  let hideDropperTimeout = 0;
  layerAntdropper.element.addEventListener(
    "mousemove"
    , function (event: MouseEvent): Boolean {
      clearTimeout(hideDropperTimeout);
      //layerAntdropper.context.strokeStyle = "#FFFFFF";
      layerAntdropper.context.clearRect(0, 0, 9999, 9999);
      layerAntdropper.context.beginPath();
      layerAntdropper.context.arc(event.offsetX, event.offsetY, antdropper.radius, 0, Math.PI * 2);
      layerAntdropper.context.stroke();
      hideDropperTimeout = setTimeout(() => {
        console.log("timeout");
        layerAntdropper.context.clearRect(0, 0, 9999, 9999)
      },
        2000
      );
      return false;
    }
  );


  const fpsStats = Stats.create(s => getElementByQuery("#stats_fps").innerHTML = s, 1000, 0);
  const antStats = Stats.create(s => getElementByQuery("#stats_ants").innerHTML = s, 1000);

  requestAnimationFrame(
    () =>
      loop(ants, anthill, fpsStats, antStats, { cellwidth, layer: layerAnthill })
  );
}

main({
  cellwidth: 2
  , numberOfAnts: 0
  , anthillID: "#layer1-anthill"
  , antdropperID: "#layer2-antdropper"
});
