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
```

This accepts a KeyedTemplateResolver as an optional contructor parameter, letting you specify custom resolver behavior if desired.  By default the resolver uses the DEFAULT_DIRECTIVES from the keyed value templates library.

Should you want attach a template to a renderer for easy reuse, use the ContextRenderer subclass.  If you want to attach standard values and functionality to one of these, you can use the DataRenderer instead.  For example, if you wanted to grant access to the standard javascript math object and it's functionality, you could do so like this:
```
const renderer = new DOMTemplateRenderer(
  {
    $use: 'cast',
    value: {
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
    },
    as: 'string'
  },
  { Math }
)
const node = render.renderData({ value: 1.4 })
```
