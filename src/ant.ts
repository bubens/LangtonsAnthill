import * as Random from "./random";
import * as Coords from "./coords";
import * as Layer from "./layer";

// BEGIN Ant
type Up = 0;
type Right = 1;
type Down = 2;
type Left = 3;

export type Direction = Left | Right;
export type Orientation = Left | Right | Up | Down;

export type Rule = Direction[];




// BEGIN Ant
export interface Ant {
  coords: Coords.Cartesian
  ; orientation: Orientation
  ; rule: Rule
}

export const create =
  (coords: Coords.Cartesian, rule: Rule, orientation: Orientation): Ant =>
    ({ coords, rule, orientation });

export const generateRule =
  (l: number): Rule =>
    Array(l).fill(0).map(() => randomDirection());


export const randomDirection =
  (generator?: Random.Generator<boolean> ): Direction =>
    Random.randomBool(generator)
      ? 1
      : 3;

export const randomOrientation =
  (generator?: Random.Generator<number>): Orientation => {
    const o = Random.randomInt(0, 3, generator);
    switch (o) {
      case 0: return 0;
      case 1: return 1;
      case 2: return 2;
      case 3: return 3;
    }
    return 0;
 };


export const nextOrientation =
  (direction: Direction, {orientation}: Ant): Orientation => {
    direction === 1
      ? (orientation+1) % 4
      : (orientation+3) % 4;

export const nextCoords =
  (curCoords: Coords.Cartesian, orientation: Orientation, width: number, height: number): Coords.Cartesian =>
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
