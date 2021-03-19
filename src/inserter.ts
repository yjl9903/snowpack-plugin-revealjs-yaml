export class Inserter {
  private cache: Record<number, string[]> = {};
  private defaultPosition: number = 0;

  constructor(private parent = document.querySelector('.reveal .slides')!) {}

  position(position: number): Inserter {
    this.defaultPosition = position;
    return this;
  }

  insert(content: string, position = this.defaultPosition): Inserter {
    if (this.cache[position] === undefined) {
      this.cache[position] = [];
    }
    this.cache[position].push(content);
    return this;
  }

  doAll() {
    for (const position in this.cache) {
      if (this.cache.hasOwnProperty(position)) {
        this.doReplace(this.cache[position], position);
      }
    }
  }

  private doReplace(contents: string[], position: number | string) {
    this.parent.innerHTML = this.parent.innerHTML.replace(
      `<!-- Insert Point ${position} -->`,
      contents.join('\n')
    );
  }
}
