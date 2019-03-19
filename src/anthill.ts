import * as Coords from "./coords";
import { Config } from "./config";
import * as Util from "./util";
import * as Ant from "./ant";
import Gradient, { Color } from "./gradient";


interface QueueItem {
    position: Coords.Cartesian,
    type: "Cell" | "Ant",
    state: number
}

interface Queue {
    cells: QueueItem[],
    ants: QueueItem[]
}

export default class Anthill {
    private grid: Uint8Array;
    private states: number;

    private layer: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private ants: Array<Ant.Ant>;

    private queue: Queue;
    private drawAnts: boolean;
    private gradient: string[];

    public readonly width: number;
    public readonly height: number;
    public readonly cellwidth: number;

    constructor(width: number, height: number, settings: Config) {
        this.grid = new Uint8Array(width * height);
        this.states = settings.states;

        this.layer = <HTMLCanvasElement>Util.getElementByQuery(settings.anthillID);
        this.context = Util.getDrawingContext(this.layer);

        this.gradient = new Gradient(settings.states).asStrings();

        this.ants = this.createAnts(settings.numberOfAnts);

        this.width = width;
        this.height = height;
        this.cellwidth = settings.cellwidth;
    }

    public getState(coords: Coords.Cartesian): number {
        return this.grid[this.getIndex(coords)];
    }

    public setState(coords: Coords.Cartesian, state: number): number {
        const s = state % this.states;
        this.grid[this.getIndex(coords)] = s;
        return s;
    }

    public incrementState(coords: Coords.Cartesian): number {
        const v = this.getState(coords) + 1;
        return this.setState(coords, v);
    }

    public addAnts(newAnts: Ant.Ant[]): void {
        this.ants = this.ants.concat(newAnts);
    }

    public tick(): void {
        [this.ants, this.queue] =
            this.ants.reduce(this.stepAnt, [[], { cells: [], ants: [] }]);

        this.queue.cells.sort(
            (c1, c2) =>
                c1.state < c2.state
                    ? -1
                    : 1
        );
    }

    public draw(): void {
        const ctx = this.context;
        const { cells, ants } = this.queue;
        const cellwidth = this.cellwidth;
        let tmpState = 0;
        let tmpColor = this.gradient[tmpState];
        for (let i = 0, l = cells.length; i < l; i += 1) {
            let curCell = cells[i];
            if (curCell.state !== tmpState) {
                tmpState = curCell.state;
                ctx.fillStyle = this.gradient[tmpState];
            }
            ctx.fillRect(curCell.position.x, curCell.position.y, cellwidth, cellwidth);
        }
        if (this.drawAnts) {
            ctx.fillStyle = "rgb(255,0,0)";
            ants.forEach(
                ant =>
                    ctx.fillRect(ant.position.x, ant.position.y, cellwidth, cellwidth)
            )
        }

    }

    public setDrawAnts(flag: boolean): void {
        this.drawAnts = flag;
    }

    private stepAnt(acc: [Ant.Ant[], Queue], ant: Ant.Ant): [Ant.Ant[], Queue] {
        const state = this.getState(ant.coords);
        const direction = ant.rule[state];
        const afterTurn = Ant.turn(direction, ant.orientation);
        const afterStep = Ant.step(ant.coords, afterTurn);

        const nextAnt = Ant.create(afterStep, ant.rule, ant.orientation);

        const drawCell: QueueItem = {
            position: ant.coords
            , state: this.incrementState(ant.coords)
            , type: "Cell"
        };

        const drawAnt: QueueItem = {
            position: afterStep
            , state: -1
            , type: "Ant"
        };


        return [
            acc[0].concat(nextAnt),
            {
                cells: acc[1].cells.concat(drawCell)
                , ants: acc[1].ants.concat(drawAnt)
            }];
    }

    private getIndex({ x, y }: Coords.Cartesian): number {
        return this.width * y + x;
    }

    private createAnts(n: number): Array<Ant.Ant> {
        return Array(n)
            .fill(this.states)
            .map(
                states =>
                    Ant.create(
                        Coords.randomCartesian(this.width, this.height),
                        Ant.generateRule(states),
                        Ant.randomOrientation()
                    )
            );
    }
}