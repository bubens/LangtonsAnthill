import * as Util from "./util";
import * as Coords from "./coords";
import * as Random from "./random";
import * as Gradient from "./gradient";
import * as Stats from "./stats";
import * as Layer from "./layer";
import * as Ant from "./ant";
import Anthill from "./anthill";
import Antdropper from "./antdropper";
import AntVisibility from "./visibility";
import config, { Config } from "./config";


const { cellwidth, states } = config;
const layerAnthill =
  Layer.create(config.anthillID);

const width =
  Math.floor(layerAnthill.element.width / cellwidth);

const height =
  Math.floor(layerAnthill.element.height / cellwidth);

const anthill = new Anthill(width, height, config);


// Handles the dropping of ants
const antdropper = new Antdropper(config);
antdropper.onDrop( anthill.addAnts );
antdropper.init();

// will ants get drawn?
const antsVisible = new AntVisibility(config.antVisibilityID);
antsVisible.onChange( anthill.setDrawAnts );
antsVisible.init();

// Handles sequential stat updates
const fpsStats =
  Stats.create(
    s =>
      Util.getElementByQuery("#stats_fps").innerHTML = s,
    1000, 0);

const antStats =
  Stats.create(
    s =>
      Util.getElementByQuery("#stats_ants").innerHTML = s,
    1000);

const gradient =
  Gradient.create(states);


const loop = (ants: Ant.Ant[], anthill: Anthill.Anthill): void => {
  // a hack. TODO: find something better.
  if (anttrap.length > 0) {
    ants = [...ants, ...anttrap];
    anttrap.length = 0;
  }

  ants = ants.map(function (ant: Ant.Ant) {
    const state =
      Anthill.getState(ant.coords, anthill);

    const direction =
      ant.rule[state];

    const newOrientation =
      Ant.nextOrientation(direction, ant.orientation);

    const newCoords =
      Ant.nextCoords(ant.coords, newOrientation);

    anthill =
      Anthill.setState(ant.coords, (state + 1) % anthill.maxStates, anthill);

    // TODO: no!
    if (antsVisible.checked) {
      Layer.draw(drawAnt(newCoords, "rgb(255,0,0)", cellwidth), consts.layer);
    }
    Layer.draw(drawAnt(ant.coords, consts.gradient[state], consts.cellwidth), consts.layer);

    return createAnt(newCoords, ant.rule, newOrientation);
  });

  fpsStats =
    Util.pipe(fpsStats)
      (Stats.onUpdate(s => { s.stat += 1; return s; })
        , Stats.onInterval(s => { s.log(s.stat); s.stat = 0; return s; })
      );

  antStats =
    Stats.onInterval(s => { s.log(ants.length + ""); return s; })(antStats);

  window.requestAnimationFrame(
    (t) =>
      loop(ants, anthill, fpsStats, antStats, consts)
  );
}



function drawAnt(coords: Coords.Cartesian, color: string, cellwidth: number): (c: CanvasRenderingContext2D) => void {
  return function (context) {
    context.fillStyle = color;
    context.fillRect(coords.x * cellwidth, coords.y * cellwidth, cellwidth, cellwidth);
  }
}