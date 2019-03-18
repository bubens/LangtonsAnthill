export const compose = (...fns: Array<(a: any) => any>) => (v: any): any =>
    fns.reduceRight(
        (acc, fn) =>
            fn(acc)
        , v
    );

export const pipe = (v: any) => (...fns: Array<(a: any) => any>): any =>
    compose.apply(undefined, fns.reverse())(v);

export const getElementByQuery =
    (query: string): Element => {
        const element: Element | null = document.querySelector(query)
        if (element === null) {
            throw new Error("Can't get element to query " + query);
        }
        else {
            return element;
        }
    };

export const getDrawingContext =
    (element: HTMLCanvasElement): CanvasRenderingContext2D => {
        const context: CanvasRenderingContext2D | null = element.getContext("2d");

        if (context === null) {
            throw new Error("Can't get rendering context for element " + element);
        }
        return context;
    };

export const setToStorage =
    (key: string, obj: any): void =>
        localStorage.setItem(key, JSON.stringify(obj));

export const getFromStorage =
    (key: string): any =>
        JSON.parse(
            localStorage.getItem(key)
        );
