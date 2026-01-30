// Quick test to compare x256 vs colors.match
const x256 = require("x256");

// Simple color matching algorithm (similar to what colors.match does)
function _simpleMatch(r, g, b) {
  // This is a simplified version - colors.match uses a more complex algorithm
  // But let's see if x256 and a simple approach differ
  const _vcolors = []; // 256 color palette would go here
  // For now, just return a simple calculation
  return Math.floor(((r + g + b) / 3 / 256) * 255);
}

const tests = [
  [255, 0, 0], // Red
  [0, 255, 0], // Green
  [0, 0, 255], // Blue
  [128, 128, 128], // Gray
  [200, 100, 50], // Orange-ish
  [128, 64, 200], // Purple-ish
  [50, 150, 200], // Blue-ish
];

console.log("RGB\t\t\tx256\tNote");
console.log("─".repeat(50));
tests.forEach((rgb) => {
  const x = x256(rgb[0], rgb[1], rgb[2]);
  console.log(`${rgb.join(",")}\t\t${x}\t(x256 result)`);
});

console.log(
  "\nNote: x256 uses a specific algorithm to map RGB to 256-color codes.",
);
console.log("colors.match() uses blessed's color matching which may differ.");
console.log(
  "\nFor blessed-contrib compatibility, we should use x256 for RGB arrays.",
);
