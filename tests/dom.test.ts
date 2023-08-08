/**
 * @jest-environment jsdom
 */
 import {
  DOMTemplateRenderer
} from '../src/dom/renderers'
import { NodeType } from 'dom-shorthand'

describe("DOMTemplateRenderer", () => {
  describe("renderTemplate", () => {
    test("should generate a node from a template and a context", () => {
      const renderer = new DOMTemplateRenderer()
      const result = renderer.renderTemplate(
        {
          tag: 'p',
          content: [
            {
              $use: 'get',
              source: [
                "Hi ",
                {
                  $use: 'get',
                  path: ['name']
                },
                "!"
              ],
              path: [
                {
                  name: 'join',
                  args: ['']
                }
              ]
            }
          ]
        },
        {
          name: "Bo"
        }
      )
      expect(result).toBeDefined()
      if(result != null) {
        expect(result.nodeType).toEqual(NodeType.ELEMENT_NODE)
        const element = result as Element
        expect(element.innerHTML).toEqual("Hi Bo!")
      }
    })
  })
})

describe("ContextRenderer", () => {
  describe("renderContext", () => {
    test("should generate a node from a context", () => {
      const renderer = new ContextRenderer({
        tag: 'p',
        content: [
          {
            $use: 'get',
            source: [
              "Hi ",
              {
                $use: 'get',
                path: ['name']
              },
              "!"
            ],
            path: [
              {
                name: 'join',
                args: ['']
              }
            ]
          }
        ]
      })
      const result = renderer.renderContext(
        {
          name: "Bo"
        }
      )
      expect(result).toBeDefined()
      if(result != null) {
        expect(result.nodeType).toEqual(NodeType.ELEMENT_NODE)
        const element = result as Element
        expect(element.innerHTML).toEqual("Hi Bo!")
      }
    })
  })
})

describe("DataRenderer", () => {
  describe("renderData", () => {
    test("should generate a node from provided data", () => {
      const renderer = new ContextRenderer({
        tag: 'p',
        content: [
          {
            $use: 'get',
            source: [
              "Hi ",
              {
                $use: 'get',
                path: ['data', 'name']
              },
              "!"
            ],
            path: [
              {
                name: 'join',
                args: ['']
              }
            ]
          }
        ]
      })
      const result = renderer.renderData(
        {
          name: "Bo"
        }
      )
      expect(result).toBeDefined()
      if(result != null) {
        expect(result.nodeType).toEqual(NodeType.ELEMENT_NODE)
        const element = result as Element
        expect(element.innerHTML).toEqual("Hi Bo!")
      }
    })
  })
})
