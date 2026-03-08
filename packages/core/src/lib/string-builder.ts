export class StringBuilder {
  private parts: string[] = [];
  private length = 0;

  append(value: string): void {
    this.parts.push(value);
    this.length += value.length;
  }

  clear(): void {
    this.parts = [];
    this.length = 0;
  }

  toString(): string {
    return this.parts.join("");
  }

  get size(): number {
    return this.length;
  }
}
