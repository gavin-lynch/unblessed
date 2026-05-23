#!/usr/bin/env tsx
/**
 * Map example
 *
 * Demonstrates world map with markers.
 */

import { Screen } from "@gavin-lynch/unblessed-node";
import { WorldMap } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const map = new WorldMap({
  label: "World Map",
  parent: screen,
});

screen.append(map);

map.addMarker({
  lon: "-79.0000",
  lat: "37.5000",
  color: "red",
  char: "X",
});

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
