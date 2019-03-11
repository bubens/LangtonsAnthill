import {getElementByQuery} from "./util";

type Callback<T> = (value:T) => void;

export default class AntVisibility {
    public checked : boolean;
    private element: HTMLInputElement;

    private hanlderRegistered : boolean;
    private callbacks : Callback<boolean>[];

    constructor(id: string) {
        this.element = <HTMLInputElement>getElementByQuery(id);
        this.checked = false;
        this.hanlderRegistered = false;
        this.callbacks = [];
    }

    onChange ( callback:(flag:boolean) => void ): AntVisibility {
        this.callbacks.push( callback );
        return this;
    }

    init (): AntVisibility {
        if ( !this.hanlderRegistered ) {
            this.hanlderRegistered = true;
            this.element.addEventListener(
                "input"
                , (event: Event): Boolean => {
                    this.checked = this.element.checked;
                    this.callbacks.forEach(
                        cb => cb(this.checked)
                    );
                    return false;
                }
            );
        }
        return this;
    }
}