# DOM Shorthand Templates
This combines the [DOM Shorthand](https://www.npmjs.com/package/dom-shorthand) and [Keyed Value Templates](https://www.npmjs.com/package/keyed-value-templates) libraries to let you create DOM nodes from object templates.  This gives the advantages of being able to store and process such templates and their immediate results as JSON objects.

# Quickstart
## Installation
You can install this library though npm like so:
```
$ npm install --save dom-shorthand-templates
```

## Usage
The simplest way to get started with this is simply creating a DOMTemplateRenderer and calling it's renderTemplate function with the template and a rendering context, like so:
```
import { DOMTemplateRenderer } from 'dom-shorthand-templates'

const renderer = new DOMTemplateRenderer()
const node = renderer.renderTemplate(
  {
    tag: 'p',
    content: [
      {
        $use: '+',
        args: [
          "Hi ",
          {
            $use: 'get',
            path: ['name']
          },
          "!"
        ]
      }
    ]
  },
  {
    name: "Bo"
  }
)
```

This accepts a KeyedTemplateResolver as an optional contructor parameter, letting you specify custom resolver behavior if desired.  By default the resolver uses the DEFAULT_DIRECTIVES from the keyed value templates library.

Note that the return value for this is DOM Node.  If you want to preview the compiled template before it's converted to a node, use the `resolveTemplate` function instead with the same parameters.

### Context Renderers
If you want an easy way to reuse the same template with different contexts, try the `ContextRenderer`.  Such renderers accept a template as it's first constructor parameter and have a `renderContext` function that will resolve that template using the provided context, like so:
```
import { ContextRenderer } from 'dom-shorthand-templates'

const renderer = new ContextRenderer(
  {
    tag: 'span',
    content: [
      {
        $use: '+',
        args: [
          "Hi. My name is ",
          {
            $use: 'get',
            path: ['name']
          },
          "."
        ]
      }
    ]
  }
)
const nameTags = [
  renderer.renderContext({ name: "Jack" }),
  renderer.renderContext({ name: "Jill" })
]
```

As with basic template renderers, there's a `resolveContextView` function if you want to get the resolved template before it's converted to a node.

### Data Renderers
If you want to a step further and have certain context values fixed for each render you can use the `DataRenderer` subclass.  Such renderers let you specify a base context as their second constructor parameter.  That context will then be used to populate the context used by the `renderData` and it's reolved template counterpart `resolveDataView`.

For example, let's say you wanted to use some javascript math functions in your template.  You could do so like this:
```
import { DataRenderer } from 'dom-shorthand-templates'

const renderer = new DataRenderer(
  {
    tag: 'span',
    content: [
      {
        $use: 'get',
        path: [
          'Math',
          {
            name: 'round',
            args: [
              {
                $use: 'get',
                path: [
                  'data',
                  'value'
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  { Math }
)
const node = render.renderData({ value: 1.4 })
```

As you may have noticed, the target value was added to the context's "data" property.  That's controlled by the renderer'a `dataKey` property, which can be set in the constructor by passing it in as the 3rd parameter.  (4th parameter is the resolver.)  If that key is an empty string, all data values will compied straight to the context as per Object.assign.

## Advanced Tricks
Here are few extra things you can do with these classes.

### Element References
If you add the template to the render context said template can reference it's own elements.  For example, lets say you had something like this:
```
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
```

That would replicate the same image in two different spots within the div.  While you could do that manually, the upside is editing the original's attributes will be automatically applied to every duplicate.

You can also use these references to set up calculated values at other points in the document, like this:
```
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
```

As with the replication trick, this has the benefit of automatically updating all those derived field for you should you need to change one of the variables in the future.  You can acheive a similar effect by making those variables part of the render context, but that means needing to store those values separately to get the same output each time.

### Components
You may have noticed the above replication trick will give you an exact copy of the original.  If you want to reuse an element but change some of it's attributes or content in each location, you'd need something like this:
```
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
```

Putting it inside a "run" directive lets you set up local variables for each location.  Meanwhile, the "resolve" directive ensures the copied sub-template gets resolved instead of just being copied and used as is.

If you have prebuilt templates you want to pass in as components and are willing to expose the renderer, you can do so like this:
```
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
```

Alternately, you can pass choose to wrap the components in their own renderers and pass them in like this:
```
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
```

In either case note that you need to use the "resolve" methods rather than the "render" methods.  Using render methods will output a DOM node which the renderer isn't expecting when processing a template.
