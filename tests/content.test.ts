import {
  KeyedTemplateResolver,
  DEFAULT_DIRECTIVES
} from 'keyed-value-templates'
import {
  WrappedValueTextDirective,
  getValueText
} from '../src/dom/content'
import {
  DOMTemplateRenderer,
  ContextRenderer,
  DOMNodeShorthandTemplate
} from '../src/dom/renderers'

describe("getValueText", () => {
  describe("for strings", () => {
    test("should use value by default", () => {
      const text = getValueText('hi')
      expect(text).toBe('hi')
    })
    test("should wrap in quotation marks if that option is set", () => {
      const text = getValueText('hi', { stringQuote: "'" })
      expect(text).toBe("'hi'")
    })
  })
  describe("for undefined", () => {
    test("should show undefined string by default", () => {
      const text = getValueText(undefined)
      expect(text).toBe('undefined')
    })
    test("should show nullish text if that option is set", () => {
      const text = getValueText(undefined, { nullishText: '' })
      expect(text).toBe('')
    })
  })
  describe("for objects", () => {
    test("should default to compact version of object text", () => {
      const text = getValueText({x: BigInt(10), y: 0})
      expect(text).toBe('{"x":10,"y":0}')
    })
    test("should insert line breaks if spaces are specified", () => {
      const text = getValueText({x: BigInt(10), y: 0}, { space: 2 })
      expect(text).toBe('{\n  "x": 10,\n  "y": 0\n}')
    })
    test("should apply nested indent", () => {
      const text = getValueText({ user: { name: 'Bob' } }, { space: 2 })
      expect(text).toBe('{\n  "user": {\n    "name": "Bob"\n  }\n}')
    })
    test("should fallback on abbreviated strings for circular references", () => {
      const children: any[] = []
      const root = { children }
      children.push({ parent: root })
      const text = getValueText(root, { space: 2 })
      expect(text).toBe(`{\n  "children": [\n    {\n      "parent": [object Object]\n    }\n  ]\n}`)
    })
  })
  describe("for arrays", () => {
    test("should default to compact version of array text", () => {
      const text = getValueText(["a", BigInt(10)])
      expect(text).toBe('["a",10]')
    })
    test("should insert line breaks if spaces are specified", () => {
      const text = getValueText(["a", BigInt(10)], { space: 2 })
      expect(text).toBe('[\n  "a",\n  10\n]')
    })
  })
  describe("for BigInt", () => {
    test("should show string version of value", () => {
      const text = getValueText(BigInt(10))
      expect(text).toBe('10')
    })
  })
  describe("for Symbols", () => {
    test("should show string version of value", () => {
      const text = getValueText(Symbol('foo'))
      expect(text).toBe('Symbol(foo)')
    })
  })
  describe("for Functions", () => {
    test("should show string version of value", () => {
      const isOdd = (n: number) => n % 2 === 1
      const text = getValueText(isOdd)
      expect(text).toBe('function (n) { return n % 2 === 1; }')
    })
  })
})

describe("WrappedValueTextDirective", () => {
  const resolver = new KeyedTemplateResolver({
    ...DEFAULT_DIRECTIVES,
    contentValue: new WrappedValueTextDirective()
  })
  describe("execute", () => {
    test("should convert value to a text array", () => {
      const copy = resolver.resolveValue(
        {
          $use: 'contentValue',
          value: 1
        },
        {}
      )
      expect(copy).toEqual(["1"])
    })
    test("should stringify objects", () => {
      const copy = resolver.resolveValue(
        {
          $use: 'contentValue',
          value: {
            x: 1
          }
        },
        {}
      )
      expect(copy).toEqual([`{"x":1}`])
    })
  })
})
