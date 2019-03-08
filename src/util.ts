export const compose = (...fns:Array<(a:any)=>any>) => (v:any):any =>
    fns.reduceRight(
        (acc, fn) =>
            fn(acc)
        , v
    );

export const pipe = (v:any) => (...fns:Array<(a:any)=>any>):any =>
    compose.apply(undefined, fns.reverse())(v);

