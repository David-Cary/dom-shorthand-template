import {
  type KeyedTemplateDirective,
  type KeyedTemplateResolver,
  type KeyValueMap,
  type ValueWrapper
} from 'keyed-value-templates'

/**
 * Alters how an untyped value should be converted to text.
 * @interface
 * @property {string} nullishText - text to use when the value is nullish
 * @property {string} stringQuote - enclosing quotation marks to use on strings
 * @property {boolean} viaJSON - should JSON stringify be used
 * @property {any} replacer - parameter to pass on to JSON stringify
 * @property {number | string} space - number of spaces or characters to use in indents
 * @property {number} depth - indent depth
 */
export interface ValueTextOptions {
  nullishText: string
  stringQuote: string
  viaJSON: boolean
  replacer: any
  space: number | string
  depth: number
}

export function getValueText (
  value: any,
  options: Partial<ValueTextOptions> = {},
  visited: any[] = []
): string {
  if (options.viaJSON != null) {
    try {
      return JSON.stringify(value, options.replacer, options.space)
    } catch (error) {
      return String(error)
    }
  }
  switch (typeof value) {
    case 'string': {
      return options.stringQuote != null
        ? options.stringQuote + value + options.stringQuote
        : value
    }
    case 'undefined': {
      return options.nullishText ?? String(value)
    }
    case 'object': {
      if (value == null) {
        return options.nullishText ?? String(value)
      }
      const text = getObjectText(value, options, visited)
      return text
    }
    default: {
      return String(value)
    }
  }
}

export function getObjectText (
  source: Record<string, any> | any[],
  options: Partial<ValueTextOptions> = {},
  visited: any[] = []
): string {
  if (visited.includes(source)) {
    return source.toLocaleString()
  }
  visited.push(source)
  const depth = options.depth != null ? options.depth + 1 : 0
  const propOptions = {
    stringQuote: '"',
    space: options.space,
    depth
  }
  let propertyOffset = ''
  let closingOffset = ''
  if (options.space != null) {
    const spaces = typeof options.space === 'number'
      ? ' '.repeat(options.space)
      : options.space
    propertyOffset = '\n' + spaces.repeat(depth + 1)
    closingOffset = '\n' + spaces.repeat(depth)
  }
  if (Array.isArray(source)) {
    let text = '['
    for (let i = 0; i < source.length; i++) {
      if (i > 0) text += ','
      text += propertyOffset + getValueText(source[i], propOptions, visited)
    }
    text += closingOffset + ']'
    return text
  }
  const valueGap = options.space != null ? ' ' : ''
  let text = '{'
  for (const key in source) {
    if (text.length > 1) text += ','
    text += propertyOffset +
      `"${key}":` +
      valueGap +
      getValueText(source[key], propOptions, visited)
  }
  text += closingOffset + '}'
  return text
}

/**
 * Alters how an untyped value should be converted to text.
 * @interface
 * @extends ValueWrapper<any>
 * @property {Partial<ValueTextOptions> | undefinecd} options - text conversion options to use on the target value
 */
export interface ValueTextParameters extends ValueWrapper<any> {
  options?: Partial<ValueTextOptions>
}

/**
 * Utility directive for converting a value to a text string.
 * @class
 */
export class ValueTextDirective implements KeyedTemplateDirective<ValueTextParameters, any> {
  processParams (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): ValueTextParameters {
    return {
      value: resolver.resolveValue(params.value),
      options: resolver.getValueMap(params.options)
    }
  }

  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    const valueString = getValueText(spec.value, spec.options)
    return valueString
  }
}

/**
 * Utility directive for converting a value to an array containing a single text string.
 * @class
 */
export class WrappedValueTextDirective extends ValueTextDirective {
  execute (
    params: KeyValueMap,
    context: KeyValueMap,
    resolver: KeyedTemplateResolver
  ): unknown {
    const spec = this.processParams(params, context, resolver)
    const valueString = getValueText(spec.value, spec.options)
    return [valueString]
  }
}
