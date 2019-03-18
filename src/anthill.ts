import * as Coords from "./coords";

export interface Anthill {
    area: Uint8Array
    ; width: number
    ; height: number
    ; maxStates: number
}
  
export const create = 
    (width: number, height: number, maxStates: number) =>
        ({
            width: width
            , height: height
            , area: new Uint8Array(width * height)
            , maxStates: maxStates
        });

export const getState =
    ( {x,y}: Coords.Cartesian, anthill: Anthill ): number =>
        anthill.area[ anthill.width * y + x ];

export const setState =
    ( {x,y}: Coords.Cartesian, state: number, anthill: Anthill ): Anthill => {
        anthill.area[ anthill.width * y + x ] = state;
        return anthill;
    };

export const incrementState =
    ( coords: Coords.Cartesian, anthill: Anthill ): Anthill =>
        setState( 
            coords
            , getState(coords, anthill) + 1
            , anthill
        );