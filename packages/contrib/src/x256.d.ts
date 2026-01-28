/**
 * Type declarations for x256 library
 *
 * x256 converts RGB values to 256-color terminal codes
 */
declare module "x256" {
  /**
   * Convert RGB values to a 256-color terminal code
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @returns 256-color code (0-255)
   */
  function x256(r: number, g: number, b: number): number;
  export default x256;
}
