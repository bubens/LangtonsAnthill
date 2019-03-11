import * as Random from "./random";
import * as Coords from "./coords";

type Up = 0;
type Right = 1;
type Down = 2;
type Left = 3;

export type Direction = Left | Right;
export type Orientation = Left | Right | Up | Down;

export type Rule = Direction[];

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
    Array(l).map(
      () => randomDirection()
    );


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


export const turn =
  (direction: Direction, orientation: Orientation): Orientation => {
    if (direction === 1) {
      switch (orientation) {
        case 0: return 1;
        case 1: return 2;
        case 2: return 3;
        case 3: return 0;
      }
    }
    else {
      switch (orientation) {
        case 0: return 3;
        case 1: return 0;
        case 2: return 1;
        case 3: return 2;
      }
    }
  };

export const step =
  ( coords: Coords.Cartesian, orientation: Orientation ): Coords.Cartesian => {
    switch (orientation) {
      case 0:
        return Coords.createCartesian(
          coords.x
          , coords.y + 1
        );
      case 1:
        return Coords.createCartesian(
          coords.x + 1
          , coords.y
        );
      case 2:
        return Coords.createCartesian(
          coords.x
          , coords.y - 1
        );
      case 3:
        return Coords.createCartesian(
          coords.x - 1
          , coords.y
        );
    }
  }
