import {
  type KeyedTemplateDirective,
  type KeyedTemplateResolver,
  type KeyValueMap
} from 'keyed-value-templates'
import {
  type DOMNodeShorthandTemplate
} from './renderers'

/**
 * Creates a copy of the target DOM node shorthand with the target attributes removed from it as well as all it's children and contents.
 * @function
 * @param {Record<string, any>} source - object to be copied
 * @param {string[]} exclusions - attributes to be removed
 * @returns {DOMNodeShorthandTemplate}
 */
export function omitNestedAttributes (
  source: DOMNodeShorthandTemplate,
  exclusions: string[]
): DOMNodeShorthandTemplate {
  if (typeof source === 'object' && source != null) {
    const copy: Record<string, any> = { ...source }
    if ('attributes' in source) {
      copy.attributes = omitProperties(
        source.attributes as Record<string, any>,
        exclusions
      )
    }
    if ('content' in source && Array.isArray(source.content)) {
      copy.content = source.content.map(
        item => omitNestedAttributes(item, exclusions)
      )
    }
    return copy
  }
  return source
}

/**
 * Creates a copy of the target object with the listed properties excluded.
 * @function
 * @param {Record<string, any>} source - object to be copied
 * @param {string[]} exclusions - properties to be removed
 * @returns {Record<string, any>}
 */
export function omitProperties (
  source: Record<string, any>,
  exclusions: string[]
): Record<string, any> {
  const copy: Record<string, any> = {}
  for (const key in source) {
    if (exclusions.includes(key)) continue
    copy[key] = source[key]
  }
  return copy
}

/**
 * Describes how content should be copied and how the copy should be modified.
 * @interface
 * @property {any} source - value to be copied or template to be used
 * @property {Record<string, any> | undefined} attributes - values to overwrite in the target element's attributes
 * @property {Record<string, any> | undefined} data - local variables to use when resolving the provided template
 */
export interface ContentDuplicationParameters {
  source: any
  attributes?: Record<string, any>
  data?: Record<string, any>
}

/**
 * Creates a copy of the provided element shorthand with it's id attribute cleared.
 * This also lets you override specified attributes and set local variables before resolving that elements template.
 * @class
 * @implements {KeyedTemplateDirective<ContentDuplicationParameters, any>}
 */
export class ContentDuplicationDirective implements KeyedTemplateDirective<ContentDuplicationParameters, any> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): ContentDuplicationParameters {
    return {
      source: resolver.resolveValue(params.source, context),
      attributes: resolver.resolveTypedValue(
        params.attributes,
        context,
        value => {
          if (typeof value === 'object' && value != null) {
            return value as Record<string, any>
          }
        }
      ),
      data: resolver.resolveTypedValue(
        params.data,
        context,
        value => {
          if (value != null) {
            return typeof value === 'object'
              ? value as Record<string, any>
              : { value }
          }
        }
      )
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    if (spec.source != null) {
      const resolvedCopy = this.resolveCopy(
        spec.source,
        context,
        resolver,
        spec.data
      )
      const renamedCopy = this.cloneNamedContent(
        resolvedCopy,
        spec.attributes
      )
      return renamedCopy
    }
  }

  resolveCopy (
    source: any,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver,
    data?: Record<string, any>
  ): any {
    if (data != null) {
      const localContext = resolver.createLocalContext(context)
      for (const key in data) {
        resolver.setLocalValue(localContext, key, data[key])
      }
      const value = resolver.resolveValue(source, localContext)
      return value
    }
    const value = resolver.resolveValue(source, context)
    return value
  }

  cloneNamedContent (
    source: DOMNodeShorthandTemplate,
    attributes?: Record<string, any>
  ): DOMNodeShorthandTemplate {
    const copy = omitNestedAttributes(source, ['id'])
    if (
      typeof copy === 'object' &&
      'tag' in copy &&
      attributes != null
    ) {
      if (copy.attributes != null) {
        Object.assign(copy.attributes, attributes)
      } else {
        copy.attributes = { ...attributes }
      }
    }
    return copy
  }
}
