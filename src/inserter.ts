export class Inserter {
  private cache: Record<number, string[]> = {};

  constructor(private parent = document.querySelector('.reveal .slides')!) {}

  insert(content: string, position = 0): Inserter {
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
