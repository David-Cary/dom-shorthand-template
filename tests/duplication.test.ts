import {
  KeyedTemplateResolver,
  DEFAULT_DIRECTIVES
} from 'keyed-value-templates'
import {
  ContentDuplicationDirective
} from '../src/dom/duplication'
import {
  DOMTemplateRenderer,
  ContextRenderer,
  DOMNodeShorthandTemplate
} from '../src/dom/renderers'

describe("ContentDuplicationDirective", () => {
  const resolver = new KeyedTemplateResolver({
    ...DEFAULT_DIRECTIVES,
    copyContent: new ContentDuplicationDirective()
  })
  describe("execute", () => {
    test("should exclude id from copied values", () => {
      const copy = resolver.resolveValue(
        {
          $use: 'copyContent',
          source: {
            $use: 'get',
            path: ['sampleElement']
          }
        },
        {
          sampleElement: {
            tag: 'p',
            attributes: {
              id: 'sample',
              class: 'indented'
            },
            content: ['Hi!']
          }
        }
      )
      expect(copy).toEqual({
        tag: 'p',
        attributes: {
          class: 'indented'
        },
        content: ['Hi!']
      })
    })
    test("should overwrite attributes with provided values", () => {
      const copy = resolver.resolveValue(
        {
          $use: 'copyContent',
          source: {
            $use: 'get',
            path: ['sampleElement']
          },
          attributes: {
            id: 'cloned',
            class: 'copied'
          }
        },
        {
          sampleElement: {
            tag: 'p',
            attributes: {
              id: 'sample',
              class: 'indented'
            },
            content: ['Hi!']
          }
        }
      )
      expect(copy).toEqual({
        tag: 'p',
        attributes: {
          id: 'cloned',
          class: 'copied'
        },
        content: ['Hi!']
      })
    })
    test("should use provided data for copy resolution", () => {
      const copy = resolver.resolveValue(
        {
          $use: 'copyContent',
          source: {
            $use: 'get',
            path: ['sampleElement']
          },
          data: {
            n: 1
          }
        },
        {
          sampleElement: {
            $use: '+',
            args: [
              '#',
              {
                $use: 'coalesce',
                args: [
                  {
                    $use: 'getVar',
                    path: ['n']
                  },
                  '_NaN_'
                ]
              }
            ]
          }
        }
      )
      expect(copy).toEqual('#1')
    })
  })
})
