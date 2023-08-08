import {
  KeyedTemplateResolver,
  type KeyValueMap,
  DEFAULT_DIRECTIVES
} from 'keyed-value-templates'
import {
  type DOMNodeShorthand,
  type DOMElementShorthand,
  shorthandToDOMDescription,
  createDescribedNode
} from 'dom-shorthand'

export const DEFAULT_TEMPLATE_RESOLVER = new KeyedTemplateResolver(DEFAULT_DIRECTIVES)

export class DOMTemplateRenderer {
  readonly resolver: KeyedTemplateResolver

  constructor (resolver: KeyedTemplateResolver = DEFAULT_TEMPLATE_RESOLVER) {
    this.resolver = resolver
  }

  renderTemplate (
    template: KeyValueMap,
    context: KeyValueMap
  ): Node | undefined {
    const resolved = this.resolveTemplate(template, context)
    const shorthand = this.extractShorthand(resolved)
    if (shorthand != null) {
      return this.renderShorthand(shorthand)
    }
  }

  renderShorthand (shorthand: DOMNodeShorthand): Node | undefined {
    const description = shorthandToDOMDescription(shorthand)
    return createDescribedNode(description)
  }

  resolveTemplate (
    template: KeyValueMap,
    context: KeyValueMap
  ): unknown {
    return this.resolver.resolveObject(template, context)
  }

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

  extractShorthandContent (source: unknown[]): DOMNodeShorthand[] {
    const items = source.map(item => this.extractShorthand(item))
    const filtered = items.filter(value => value !== undefined) as DOMNodeShorthand[]
    return filtered
  }

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

  stringify (source: unknown): string {
    return typeof source === 'object' && source != null
      ? JSON.stringify(source)
      : String(source)
  }
}

export class ContextRenderer extends DOMTemplateRenderer {
  template: KeyValueMap

  constructor (
    template: KeyValueMap = {},
    resolver: KeyedTemplateResolver = DEFAULT_TEMPLATE_RESOLVER
  ) {
    super(resolver)
    this.template = template
  }

  renderContext (context: KeyValueMap): Node | undefined {
    const resolved = this.resolveContextView(context)
    const shorthand = this.extractShorthand(resolved)
    if (shorthand != null) {
      return this.renderShorthand(shorthand)
    }
  }

  resolveContextView (context: KeyValueMap): unknown {
    return this.resolver.resolveObject(this.template, context)
  }
}

export const DEFAULT_DATA_KEY = 'data'

export class DataRenderer extends ContextRenderer {
  baseContext: KeyValueMap
  dataKey: string

  constructor (
    template: KeyValueMap = {},
    baseContext: KeyValueMap = {},
    dataKey = DEFAULT_DATA_KEY,
    resolver: KeyedTemplateResolver = DEFAULT_TEMPLATE_RESOLVER
  ) {
    super(template, resolver)
    this.baseContext = baseContext
    this.dataKey = dataKey
  }

  renderData (data: KeyValueMap): Node | undefined {
    const resolved = this.resolveDataView(data)
    const shorthand = this.extractShorthand(resolved)
    if (shorthand != null) {
      return this.renderShorthand(shorthand)
    }
  }

  resolveDataView (data: KeyValueMap): unknown {
    const context = { ...this.baseContext }
    if (this.dataKey.length > 0) {
      context[this.dataKey] = data
    }
    return this.resolver.resolveObject(this.template, context)
  }
}
