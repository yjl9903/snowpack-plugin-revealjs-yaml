import { PluginLoadOptions, SnowpackConfig, SnowpackPlugin } from 'snowpack';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

const plugin = (
  snowpackConfig: SnowpackConfig,
  pluginOptions: any
): SnowpackPlugin => {
  return {
    name: '@yjl9903/snowpack-plugin-revealjs-yaml',
    resolve: {
      input: ['.yaml'],
      output: ['.js'],
    },
    config() {},
    async load({ filePath }: PluginLoadOptions) {
      const doc = load(readFileSync(filePath, 'utf8'));
      console.log(doc);
      return `const text = ''; export default text;`;
    },
  };
};

export { plugin };
