import {
  KeyedTemplateResolver,
  type KeyValueMap,
  type KeyedValueTemplate,
  type ReplacableValue,
  DEFAULT_DIRECTIVES
} from 'keyed-value-templates'
import {
  type DOMNodeShorthand,
  type DOMElementShorthand,
  type DOMAttributeShorthand,
  type DOMCDataShorthand,
  type DOMProcessingInstructionShorthand,
  type DOMCommentShorthand,
  type DOMFragmentShorthand,
  shorthandToDOMDescription,
  createDescribedNode
} from 'dom-shorthand'

/**
 * Lets all DOMNodeShorthand types use directive requests.
 */
export type DOMNodeShorthandTemplate = (
  ReplacableValue<string> |
  KeyedValueTemplate<
  DOMElementShorthand |
  DOMAttributeShorthand |
  DOMCDataShorthand |
  DOMProcessingInstructionShorthand |
  DOMCommentShorthand |
  DOMFragmentShorthand
  >
)

export const DEFAULT_TEMPLATE_RESOLVER = new KeyedTemplateResolver(DEFAULT_DIRECTIVES)

/**
 * Provides utility functions for generating DOM nodes from a given template and context.
 * @property {KeyedTemplateResolver} resolver - used to resolve the template to a context specific state
 */
export class DOMTemplateRenderer {
  readonly resolver: KeyedTemplateResolver

  constructor (resolver: KeyedTemplateResolver = DEFAULT_TEMPLATE_RESOLVER) {
    this.resolver = resolver
  }

  /**
   * Tries to the template to a DOM node for the given context.
   * @param {KeyValueMap} template - data to be converted
   * @param {KeyValueMap} context - reference data for converting the template
   * @returns {Node | undefined} the resulting node, if the template resolved to a valid shorthand
   */
  renderTemplate (
    template: DOMNodeShorthandTemplate,
    context: KeyValueMap
  ): Node | undefined {
    const resolved = this.resolveTemplate(template, context)
    const shorthand = this.extractShorthand(resolved)
    if (shorthand != null) {
      return this.renderShorthand(shorthand)
    }
  }

  /**
   * Tries to create a DOM node from a given shorthand.
   * @param {DOMNodeShorthand} shorthand - data to be converted
   * @returns {Node | undefined} the resulting node
   */
  renderShorthand (shorthand: DOMNodeShorthand): Node | undefined {
    const description = shorthandToDOMDescription(shorthand)
    return createDescribedNode(description)
  }

  /**
   * Retrieves a version of the template's data with alll directives applied for the given context.
   * @param {KeyValueMap} template - data to be converted
   * @param {KeyValueMap} context - reference data for resolving the template
   * @returns {Node | undefined} the resolved results
   */
  resolveTemplate (
    template: DOMNodeShorthandTemplate,
    context: KeyValueMap
  ): unknown {
    return this.resolver.resolveValue(template, context)
  }

  /**
   * Tries to convert untyped data to a DOMNodeShorthand.
   * @param {unknown} source - data to be converted
   * @returns {DOMNodeShorthand | undefined} the resulting shorthand, if successful
   */
  extractShorthand (source: unknown): DOMNodeShorthand | undefined {
    switch (typeof source) {
      case 'object': {
        if (source != null) {
          // Return as DOMFragmentShorthand
          if (Array.isArray(source)) {
            return {
              content: this.extractShorthandContent(source)
            }
          }
          // Return as DOMElementShorthand
          if ('tag' in source) {
            const element: DOMElementShorthand = {
              tag: String(source.tag)
            }
            if ('attributes' in source) {
              element.attributes = this.extractShorthandAttributes(source.attributes)
            }
            if ('content' in source && Array.isArray(source.content)) {
              element.content = this.extractShorthandContent(source.content)
            }
            return element
          }
          // Return as DOMAttributeShorthand
          if ('name' in source && 'value' in source) {
            return {
              name: String(source.name),
              value: source.value != null ? String(source.value) : null
            }
          }
          // Return as DOMCDataShorthand
          if ('cData' in source) {
            return {
              cData: this.stringify(source.cData)
            }
          }
          // Return as DOMCommentShorthand
          if ('comment' in source) {
            return {
              comment: this.stringify(source.comment)
            }
          }
          // Return as DOMProcessingInstructionShorthand
          if ('target' in source && 'data' in source) {
            return {
              target: String(source.target),
              data: this.stringify(source.data)
            }
          }
          // Return as DOMFragmentShorthand
          if ('content' in source && Array.isArray(source.content)) {
            return {
              content: this.extractShorthandContent(source.content)
            }
          }
        }
        break
      }
      case 'string': {
        return source
      }
    }
  }

  /**
   * Applies untyped data to a DOMNodeShorthand conversion to array items, filtering out failed conversions.
   * @param {unknown[]} source - array whose contents are to be converted
   * @returns {DOMNodeShorthand[]} an array of successfully converted items
   */
  extractShorthandContent (source: unknown[]): DOMNodeShorthand[] {
    const items = source.map(item => this.extractShorthand(item))
    const filtered = items.filter(value => value !== undefined) as DOMNodeShorthand[]
    return filtered
  }

  /**
   * Extracts an attribute map from untyped data.
   * @param {unknown} source - data to be evaluated
   * @returns {Record<string, string>} extracted attribute map
   */
  extractShorthandAttributes (source: unknown): Record<string, string> {
    if (typeof source === 'object' && source != null && !Array.isArray(source)) {
      const valueMap = source as KeyValueMap
      const results: Record<string, string> = {}
      for (const key in valueMap) {
        const value = valueMap[key]
        results[key] = this.stringify(value)
      }
      return results
    }
    return {}
  }

  /**
   * Converts untyped data to string, trying to preserve object data in doing so.
   * @param {unknown} source - data to be converted
   * @returns {string} the resulting string
   */
  stringify (source: unknown): string {
    return typeof source === 'object' && source != null
      ? JSON.stringify(source)
      : String(source)
  }
}

/**
 * A DOMTemplateRenderer with it's own template property so it can render with just a context.
 * @property {DOMNodeShorthandTemplate} template - template to use when no other is specified
 */
export class ContextRenderer extends DOMTemplateRenderer {
  template: DOMNodeShorthandTemplate

  constructor (
    template: DOMNodeShorthandTemplate = {},
    resolver: KeyedTemplateResolver = DEFAULT_TEMPLATE_RESOLVER
  ) {
    super(resolver)
    this.template = template
  }

  /**
   * Tries to generate a Node for a given context.
   * @param {KeyValueMap} context - data to be used for Node generation
   * @returns {DOMNodeShorthand | undefined} the resulting node
   */
  renderContext (context: KeyValueMap): Node | undefined {
    const resolved = this.resolveContextView(context)
    const shorthand = this.extractShorthand(resolved)
    if (shorthand != null) {
      return this.renderShorthand(shorthand)
    }
  }

  /**
   * Generates raw display data for the provided context.  This needs to passed through extractShorthand to ensure proper formatting.
   * @param {KeyValueMap} context - data to be used for display data generation
   * @returns {unknown} the resulting display data
   */
  resolveContextView (context: KeyValueMap): unknown {
    return this.resolver.resolveValue(this.template, context)
  }
}

export const DEFAULT_DATA_KEY = 'data'

/**
 * A specialized ContextRenderer that lets you separate utility functions and constants from the data to be rendered.
 * @property {KeyValueMap} baseContext - provides default context values
 * @property {string} dataKey - key used to attach passed in data to the context
 */
export class DataRenderer extends ContextRenderer {
  baseContext: KeyValueMap
  dataKey: string

  constructor (
    template: DOMNodeShorthandTemplate = {},
    baseContext: KeyValueMap = {},
    dataKey = DEFAULT_DATA_KEY,
    resolver: KeyedTemplateResolver = DEFAULT_TEMPLATE_RESOLVER
  ) {
    super(template, resolver)
    this.baseContext = baseContext
    this.dataKey = dataKey
  }

  /**
   * Tries to generate a Node for a given data map.
   * @param {KeyValueMap} data - data to be used for Node generation
   * @returns {DOMNodeShorthand | undefined} the resulting node
   */
  renderData (data: KeyValueMap): Node | undefined {
    const resolved = this.resolveDataView(data)
    const shorthand = this.extractShorthand(resolved)
    if (shorthand != null) {
      return this.renderShorthand(shorthand)
    }
  }

  /**
   * Generates raw display data from the provided data.  This needs to passed through extractShorthand to ensure proper formatting.
   * @param {KeyValueMap} data - data to be used for display data generation
   * @returns {unknown} the resulting display data
   */
  resolveDataView (data: KeyValueMap): unknown {
    const context = { ...this.baseContext }
    if (this.dataKey.length > 0) {
      context[this.dataKey] = data
    } else {
      Object.assign(context, data)
    }
    return this.resolver.resolveValue(this.template, context)
  }
}
