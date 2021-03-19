# Snowpack Plugin Reveal.js Yaml

[![Node CI](https://github.com/yjl9903/snowpack-plugin-revealjs-yaml/actions/workflows/node.yml/badge.svg)](https://github.com/yjl9903/snowpack-plugin-revealjs-yaml/actions/workflows/node.yml)

Generate a Reveal.js Slide with Snowpack and Yaml.

## Guide

### Create New Slide

Use [Create Snowpack App](https://github.com/snowpackjs/snowpack/tree/main/create-snowpack-app/cli) and template [
app-template-revealjs
](https://github.com/yjl9903/app-template-revealjs).

```bash
yarn create snowpack-app new-dir --template @yjl9903/app-template-revealjs --use-yarn
# or
npx create-snowpack-app new-dir --template @yjl9903/app-template-revealjs [--use-yarn | --use-pnpm | --no-install]
```

### Register Plugin

In the `snowpack.config.js`, add plugin `@yjl9903/snowpack-plugin-revealjs-yaml
`.

```js
plugins: [
  [
    "@yjl9903/snowpack-plugin-revealjs-yaml",
    {
      rules: [
        {
          type: 'title',
          fn(el) {
            return `<h2>${el.content}</h2>`;
          }
        }
      ]
    }
  ]
]
```

You can create custom element rule in the plugin option.

### Create new section

Create a new yaml file `problem.yaml`.

```yaml
Problem:
  statement:
    - type: title
      content: A + B
    - Calculate $A + B$!
    - $1 \le A + B \le 10^9$.
  solution:
    - type: title
      content: A + B
    - Just output $A + B$! 
```

Then, import this file in the `index.js`, and use `Inserter` to replace the `<!-- Insert Point 0 -->` in the `index.html`.

```js
import ProblemSlide from './problem.yaml'

import { Inserter } from '@yjl9903/snowpack-plugin-revealjs-yaml/dist/inserter'

new Inserter()
  .position(0)
    .insert(ProblemSlide)
  .doAll()

// ...
// insert before initializing
slide.initialize();
```
