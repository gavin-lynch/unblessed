#!/usr/bin/env tsx
/**
 * Carousel example
 *
 * Demonstrates cycling through multiple pages of widgets.
 */

import { Box } from "@gavin-lynch/unblessed-core";
import { Screen } from "@gavin-lynch/unblessed-node";
import { Carousel, Grid, Line, WorldMap } from "../src/index.js";

function page1(screen: Screen) {
  const grid = new Grid({ rows: 4, cols: 4, screen: screen });

  const line = grid.set(1, 0, 2, 2, (opts) => new Line(opts), {
    style: {
      line: "yellow",
      text: "green",
      baseline: "black",
    },
    xLabelPadding: 3,
    xPadding: 5,
    label: "Stocks",
  });

  const _map = grid.set(1, 2, 2, 2, (opts) => new WorldMap(opts), {
    label: "Servers Location",
  });

  const box = new Box({
    content:
      "click right-left arrows or wait 3 seconds for the next layout in the carousel",
    top: "80%",
    left: "10%",
    parent: screen,
  });
  screen.append(box);

  const lineData = {
    x: ["t1", "t2", "t3", "t4"],
    y: [5, 1, 7, 5],
  };

  line.setData([lineData]);
}

function page2(screen: Screen) {
  const line = new Line({
    width: 80,
    height: 30,
    left: 15,
    top: 12,
    xPadding: 5,
    label: "Title",
    parent: screen,
  });

  const data = [
    {
      title: "us-east",
      x: ["t1", "t2", "t3", "t4"],
      y: [0, 0.0695652173913043, 0.11304347826087, 2],
      style: {
        line: "red",
      },
    },
  ];

  screen.append(line);
  line.setData(data);

  const box = new Box({
    content:
      "click right-left arrows or wait 3 seconds for the next layout in the carousel",
    top: "80%",
    left: "10%",
    parent: screen,
  });
  screen.append(box);
}

const screen = new Screen({ smartCSR: true });

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

const carousel = new Carousel([page1, page2], {
  screen: screen,
  interval: 3000,
  controlKeys: true,
});
carousel.start();

screen.render();
