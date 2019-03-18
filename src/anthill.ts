import * as Coords from "./coords";
import { Config } from "./config";
import * as Util from "./util";
import * as Ant from "./ant";
import Gradient, { Color } from "./gradient";

interface QueueItem {
    position: Coords.Cartesian,
    state: number
}

export default class Anthill {
    private grid: Uint8Array;
    private states: number;

    private layer: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private ants: Array<Ant.Ant>;

    private queue: any;

    public readonly width: number;
    public readonly height: number;

    constructor(width: number, height: number, settings: Config) {
        this.grid = new Uint8Array(width * height);
        this.states = settings.states;

        this.layer = <HTMLCanvasElement>Util.getElementByQuery(settings.anthillID);
        this.context = Util.getDrawingContext(this.layer);

        this.ants = this.createAnts(settings.numberOfAnts);

        this.width = width;
        this.height = height;
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

    public newAnts( newAnts: Array<Ant.Ant> ): void {
        this.ants = this.ants.concat( newAnts );
    }

    public tick(): void {
        [this.ants, this.queue] =
            this.ants.reduce(
                (acc, ant) => {

                }
            )
    }

    private stepAnt( ant: Ant.Ant ): Ant.Ant {
        const state = this.getState( ant.coords );
        const direction = ant.rule[state];
        const afterTurn = Ant.turn( direction, ant.orientation);
        const afterStep = Ant.step( ant.coords, afterTurn );

        this.incrementState( ant.coords );
        return 
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