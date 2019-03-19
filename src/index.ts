import {getElementByQuery, pipe} from "./util";
import * as Stats from "./stats";
import Anthill from "./anthill";
import Antdropper from "./antdropper";
import AntVisibility from "./visibility";
import config from "./config";

// clever!
const [width, height] = 
  pipe( config.anthillID )
    ( id => <HTMLCanvasElement>getElementByQuery(id)
    , elem => [elem.width, elem.height]
    , ([w, h]) => [ parseInt( w, 10 ), parseInt(h, 10) ]
    , ([w, h]) => [ Math.floor( w/config.cellwidth ), Math.floor( h/config.cellwidth) ]
  );

// Main module
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
      getElementByQuery("#stats_fps").innerHTML = s,
    1000, 0);

const antStats =
  Stats.create(
    s =>
      getElementByQuery("#stats_ants").innerHTML = s,
    1000);


const loop = (antstat: Stats.Stat, fpsstat: Stats.Stat): void => {
  new Promise( (resolve) => {
    requestAnimationFrame( () => {
      anthill.draw();
      antstat = 
        pipe(fpsStats)
          ( Stats.onUpdate(s => { s.stat += 1; return s; })
          , Stats.onInterval(s => { s.log(s.stat); s.stat = 0; return s; })
          );
      fpsstat =
        pipe(fpsStats)
          ( Stats.onUpdate(s => { s.stat += 1; return s; })
          , Stats.onInterval(s => { s.log(s.stat); s.stat = 0; return s; })
          );
      resolve([antstat,fpsstat]);
    });
  }).then( ([antstat, fpsstat]) => {
    anthill.tick();
    loop(antstat, fpsstat);
  });
};

loop(antStats, fpsStats);