/**
 * @jest-environment jsdom
 */
 import {
  type KeyValueMap
} from 'keyed-value-templates'
import {
  DOMTemplateRenderer,
  ContextRenderer,
  DOMNodeShorthandTemplate
} from '../src/dom/renderers'

describe("Template Self References", () => {
  test("should allow for replicating an element by reference", () => {
    const renderer = new DOMTemplateRenderer()
    const template = {
      tag: 'div',
      content: [
        {
          tag: 'img',
          attributes: {
            src: 'https://some.site/img_01.gif'
          }
        },
        " equals ",
        {
          $use: 'get',
          path: [
            'template',
            'content',
            0
          ]
        }
      ]
    }
    const context = { template }
    const result = renderer.renderTemplate(template, context)
    expect(result?.lastChild?.nodeName).toEqual('IMG')
    if(result?.lastChild != null) {
      const element = result.lastChild as Element
      expect(element.getAttribute('src')).toEqual('https://some.site/img_01.gif')
    }
  })
  test("should allow computed values from earlier elements", () => {
    const renderer = new DOMTemplateRenderer()
    const template = {
      tag: 'div',
      content: [
        'a = ',
        '3',
        ", b = ",
        '4',
        ", a + b = ",
        {
          $use: '+',
          args: [
            {
              $use: 'cast',
              as: 'number',
              value: {
                $use: 'get',
                path: [
                  'template',
                  'content',
                  1
                ]
              }
            },
            {
              $use: 'cast',
              as: 'number',
              value: {
                $use: 'get',
                path: [
                  'template',
                  'content',
                  3
                ]
              }
            }
          ]
        }
      ]
    }
    const context = { template }
    const result = renderer.renderTemplate(template, context)
    expect(result).toBeDefined()
    if(result != null) {
      const element = result as Element
      expect(element.innerHTML).toEqual("a = 3, b = 4, a + b = 7")
    }
  })
  test("should allow component emulation", () => {
    const renderer = new DOMTemplateRenderer()
    const template = {
      tag: 'div',
      content: [
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['n'],
              value: 1
            },
            {
              $use: 'return',
              value: {
                $use: '+',
                args: [
                  '#',
                  {
                    $use: 'getVar',
                    path: ['n']
                  }
                ]
              }
            }
          ]
        },
        ', ',
        {
          $use: 'run',
          steps: [
            {
              $use: 'set',
              path: ['n'],
              value: 2
            },
            {
              $use: 'return',
              value: {
                $use: 'resolve',
                value: {
                  $use: 'get',
                  path: [
                    'template',
                    'content',
                    0,
                    'steps',
                    1,
                    'value'
                  ]
                }
              }
            }
          ]
        }
      ]
    }
    const context = { template }
    const result = renderer.renderTemplate(template, context)
    expect(result).toBeDefined()
    if(result != null) {
      const element = result as Element
      expect(element.innerHTML).toEqual("#1, #2")
    }
  })
})

describe("Context Components", () => {
  test("should allow use of imported component renderers", () => {
    const poundComponent = new ContextRenderer({
      tag: 'span',
      content: [
        {
          $use: '+',
          args: [
            '#',
            {
              $use: 'get',
              path: ['value']
            }
          ]
        }
      ]
    })
    const renderer = new DOMTemplateRenderer()
    const template = {
      tag: 'div',
      content: [
        {
          $use: 'get',
          path: [
            'poundComponent',
            {
              name: 'resolveContextView',
              args: [
                {
                  value: 1
                }
              ]
            }
          ]
        }
      ]
    }
    const context = { poundComponent }
    const result = renderer.renderTemplate(template, context)
    expect(result).toBeDefined()
    if(result != null) {
      const element = result as Element
      expect(element.innerHTML).toEqual("<span>#1</span>")
    }
  })
  test("should allow use of imported template if renderer access is set up", () => {
    const poundTemplate = {
      tag: 'span',
      content: [
        {
          $use: '+',
          args: [
            '#',
            {
              $use: 'get',
              path: ['value']
            }
          ]
        }
      ]
    }
    const renderer = new DOMTemplateRenderer()
    const template = {
      tag: 'div',
      content: [
        {
          $use: 'get',
          path: [
            'renderer',
            {
              name: 'resolveTemplate',
              args: [
                {
                  $use: 'get',
                  path: ['poundTemplate']
                },
                {
                  value: 1
                }
              ]
            }
          ]
        }
      ]
    }
    const context = {
      renderer,
      poundTemplate
    }
    const result = renderer.renderTemplate(template, context)
    expect(result).toBeDefined()
    if(result != null) {
      const element = result as Element
      expect(element.innerHTML).toEqual("<span>#1</span>")
    }
  })
})
