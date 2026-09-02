import type { PlaceId } from "../../../state/types";
import { beach } from "./beach";
import { blank } from "./blank";
import { dino } from "./dino";
import { home } from "./home";
import { mountain } from "./mountain";
import { park } from "./park";
import { playground } from "./playground";
import { river } from "./river";
import { school } from "./school";
import { sea } from "./sea";
import { sky } from "./sky";
import { space } from "./space";
import type { PlaceArt } from "./types";

export const PLACE_ART: Record<PlaceId, PlaceArt> = {
  blank,
  home,
  sea,
  sky,
  beach,
  river,
  playground,
  park,
  mountain,
  dino,
  space,
  school,
};
