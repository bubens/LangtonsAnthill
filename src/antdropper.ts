import * as Ant from "./ant";
import * as Util from "./util";
import * as Coords from "./coords";
import { Config, SliderConfig } from "./config";

type Callback<T> = (value: T) => any;

export default class Antdropper {
    private layer: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private radius: Slider;
    private amount: Slider;
    private cellwidth: number;
    private states: number;
    private handlerRegistered: boolean;
    private callbacks: Callback<Ant.Ant[]>[];
    public position: Coords.Cartesian;

    constructor(settings: Config) {
        this.layer = <HTMLCanvasElement>Util.getElementByQuery(settings.antdropperID);
        this.context = Util.getDrawingContext(this.layer);

        this.radius = new Slider(settings.dropperRadius);
        this.amount = new Slider(settings.dropperAmount);

        this.cellwidth = settings.cellwidth;
        this.states = settings.states;

        this.callbacks = [];
        this.handlerRegistered = false;
    }

    private randomAnt =
        (states: number) => (coords: Coords.Cartesian): Ant.Ant =>
            Ant.create(
                coords,
                Ant.generateRule(states),
                Ant.randomOrientation()
            );

    private offsetCoords =
        (cellwidth: number, offsetX: number, offsetY: number) => ({ x, y }: Coords.Cartesian): Coords.Cartesian =>
            Coords.createCartesian(
                (x + offsetX) / cellwidth,
                (y + offsetY) / cellwidth
            );



    public init(): Antdropper {
        this.layer.addEventListener(
            "mousemove"
            , (event: MouseEvent): Boolean => {
                this.position = Coords.createCartesian(event.offsetX, event.offsetY);
                return false;
            }
        );
        return this;
    }

    public frame(t: number): void {
        const ctx = this.context;
        ctx.clearRect(0, 0, 9999, 9999);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius.value, 0, Math.PI * 2);
        ctx.stroke();
    }

    private createAnts(offsetX: number, offsetY: number): Ant.Ant[] {
        return Array(this.amount.value)
            .fill(this.radius.value)
            .map((r: number): Ant.Ant =>
                Util.pipe(r)
                    (Coords.randomCartesianInRadius
                        , this.offsetCoords(this.cellwidth, offsetX, offsetY)
                        , this.randomAnt(this.states)
                    )
            );
    }

    public onDrop(callback: Callback<Ant.Ant[]>): void {
        this.callbacks.push(callback);

        if (!this.handlerRegistered) {
            this.layer.addEventListener(
                "mousedown"
                , (event: MouseEvent): Boolean => {
                    event.preventDefault();
                    const droppedAnts = this.createAnts(event.offsetX, event.offsetY);
                    this.callbacks.forEach(
                        cb => cb(droppedAnts)
                    );
                    return false;
                }
            );
            this.handlerRegistered = true;
        }
    }
}

class Slider {
    private slider: HTMLInputElement;
    private feedback: HTMLElement;
    private settings: SliderConfig;

    public value: number;

    private handlerRegistered: boolean;
    private callbacks: Callback<number>[];

    constructor(settings: SliderConfig) {
        this.settings = settings;

        this.slider =
            <HTMLInputElement>Util.getElementByQuery(settings.elementID);

        this.feedback =
            <HTMLElement>Util.getElementByQuery(settings.feedbackElementID);

        this.value =
            <number>Util.getFromStorage(settings.storageKey)
            || settings.defaultValue;

    }

    public onChange(callback: Callback<number>): void {
        this.callbacks.push(callback);
        if (this.handlerRegistered) {
            this.slider.addEventListener(
                "input"
                , (event: Event): boolean => {
                    event.preventDefault();

                    const value =
                        this.slider.valueAsNumber;

                    this.feedback.innerHTML = "" + value;

                    Util.setToStorage(this.settings.storageKey, value);

                    callback(value);
                    return false;
                }
            );
        }
    }
}