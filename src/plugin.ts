import { PluginLoadOptions, SnowpackConfig, SnowpackPlugin } from 'snowpack';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

interface SectionConfig {
  className?: string[];
  style?: Record<string, string | number>;
}

interface CustomTextElement {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div';
  content: string;
  className?: string[];
  style?: Record<string, string | number>;
}

interface ImgElement {
  type: 'img';
  src: string;
  className?: string[];
  style?: Record<string, string | number>;
}

interface UlElement {
  type: 'ul';
  className?: string[];
  contents: string[];
}

type SectionElement =
  | string
  | number
  | boolean
  | ({ type: 'config' } & SectionConfig)
  | CustomTextElement
  | ImgElement
  | UlElement;

type SlideSubSection = Array<SectionElement>;

type SlideMainSection = Omit<Record<string, SlideSubSection>, 'config'> & {
  config?: SectionConfig;
};

type SlideSection = SlideMainSection | SlideSubSection;

type YamlSlideConfig = Record<string, SlideSection>;

class Parser {
  private defaultSectionElementTag: string = 'p';
  private defaultSectionElementClass: string[] = [];

  private customElementRules: Record<string, (config: any) => string> = {};

  registerCustomElementRule(type: string, fn: (config: any) => string) {
    this.customElementRules[type] = fn;
  }

  parse(doc: YamlSlideConfig): string {
    const result: string[] = [];
    for (const sectionName in doc) {
      if (doc.hasOwnProperty(sectionName)) {
        result.push(this.parseSection(doc[sectionName]));
      }
    }
    return result.join('\n').replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  }

  private createElement(
    content: string,
    tag = this.defaultSectionElementTag,
    className = this.defaultSectionElementClass,
    style: Record<string, string | number> = {},
    attr: Record<string, string | number> = {}
  ) {
    const extraAttrs: string[] = [];
    for (const key in attr) {
      if (attr.hasOwnProperty(key)) {
        extraAttrs.push(`${key}="${attr[key]}"`);
      }
    }
    return `<${tag} class="${className.join(' ')}" ${extraAttrs.join(
      ' '
    )}>${content}</${tag}>`;
  }

  private parseSubSection(slideSubSection: SlideSubSection): string {
    const sectionConfig: SectionConfig =
      (slideSubSection.find((sectionElement) => {
        return (
          typeof sectionElement === 'object' && sectionElement.type === 'config'
        );
      }) as SectionConfig) ?? {};
    return this.createElement(
      slideSubSection
        .map((sectionElement) => {
          if (typeof sectionElement === 'string') {
            return this.createElement(sectionElement);
          } else if (typeof sectionElement === 'number') {
            return this.createElement(sectionElement.toString());
          } else if (typeof sectionElement === 'boolean') {
            return this.createElement(sectionElement ? 'true' : 'false');
          } else if (
            typeof sectionElement === 'object' &&
            sectionElement.type !== undefined &&
            sectionElement.type !== null
          ) {
            if (
              ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'].findIndex(
                (key) => key === sectionElement.type
              ) !== -1
            ) {
              const customSectionElement = sectionElement as CustomTextElement;
              return this.createElement(
                customSectionElement.content,
                customSectionElement.type,
                customSectionElement.className ?? []
              );
            } else if (sectionElement.type === 'img') {
              const customSectionElement = sectionElement as ImgElement;
              return this.createElement(
                '',
                'img',
                customSectionElement.className ?? [],
                {},
                { src: sectionElement.src }
              );
            } else if (sectionElement.type === 'ul') {
              const customSectionElement = sectionElement as UlElement;
              const text = customSectionElement.contents
                .map((item) => {
                  return `<li>${item}</li>`;
                })
                .join('\n');
              return this.createElement(
                text,
                'ul',
                customSectionElement.className ?? []
              );
            } else if (
              this.customElementRules.hasOwnProperty(sectionElement.type)
            ) {
              return this.customElementRules[sectionElement.type](
                sectionElement
              );
            }
          }
          return '';
        })
        .join('\n'),
      'section',
      sectionConfig.className ?? []
    );
  }

  private parseMainSection(slideMainSection: SlideMainSection): string {
    const result: string[] = [];
    for (const subSectionName in slideMainSection) {
      if (subSectionName === 'config') continue;
      if (slideMainSection.hasOwnProperty(subSectionName)) {
        result.push(this.parseSubSection(slideMainSection[subSectionName]));
      }
    }
    return this.createElement(
      result.join('\n'),
      'section',
      slideMainSection?.config?.className ?? []
    );
  }

  private parseSection(slideSection: SlideSection): string {
    if (Array.isArray(slideSection)) {
      return this.parseSubSection(slideSection);
    } else {
      return this.parseMainSection(slideSection);
    }
  }
}

interface PluginOptions {
  rules?: Array<{ type: string; fn: (config: any) => string }>;
}

const plugin = (
  snowpackConfig: SnowpackConfig,
  pluginOptions: PluginOptions
): SnowpackPlugin => {
  const parser = new Parser();
  if (Array.isArray(pluginOptions.rules)) {
    for (const rule of pluginOptions.rules) {
      parser.registerCustomElementRule(rule.type, rule.fn);
    }
  }
  return {
    name: '@yjl9903/snowpack-plugin-revealjs-yaml',
    resolve: {
      input: ['.yaml'],
      output: ['.js'],
    },
    config() {},
    async load({ filePath }: PluginLoadOptions) {
      const doc = load(readFileSync(filePath, 'utf8')) as YamlSlideConfig;
      return `const text = \`${parser.parse(doc)}\`; export default text;`;
    },
  };
};

export { plugin };
