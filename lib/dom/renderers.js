"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRenderer = exports.DEFAULT_DATA_KEY = exports.ContextRenderer = exports.DOMTemplateRenderer = exports.DEFAULT_TEMPLATE_RESOLVER = void 0;
var keyed_value_templates_1 = require("keyed-value-templates");
var dom_shorthand_1 = require("dom-shorthand");
exports.DEFAULT_TEMPLATE_RESOLVER = new keyed_value_templates_1.KeyedTemplateResolver(keyed_value_templates_1.DEFAULT_DIRECTIVES);
/**
 * Provides utility functions for generating DOM nodes from a given template and context.
 * @property {KeyedTemplateResolver} resolver - used to resolve the template to a context specific state
 */
var DOMTemplateRenderer = /** @class */ (function () {
    function DOMTemplateRenderer(resolver) {
        if (resolver === void 0) { resolver = exports.DEFAULT_TEMPLATE_RESOLVER; }
        this.resolver = resolver;
    }
    /**
     * Tries to the template to a DOM node for the given context.
     * @param {KeyValueMap} template - data to be converted
     * @param {KeyValueMap} context - reference data for converting the template
     * @returns {Node | undefined} the resulting node, if the template resolved to a valid shorthand
     */
    DOMTemplateRenderer.prototype.renderTemplate = function (template, context) {
        var resolved = this.resolveTemplate(template, context);
        var shorthand = this.extractShorthand(resolved);
        if (shorthand != null) {
            return this.renderShorthand(shorthand);
        }
    };
    /**
     * Tries to create a DOM node from a given shorthand.
     * @param {DOMNodeShorthand} shorthand - data to be converted
     * @returns {Node | undefined} the resulting node
     */
    DOMTemplateRenderer.prototype.renderShorthand = function (shorthand) {
        var description = (0, dom_shorthand_1.shorthandToDOMDescription)(shorthand);
        return (0, dom_shorthand_1.createDescribedNode)(description);
    };
    /**
     * Retrieves a version of the template's data with alll directives applied for the given context.
     * @param {KeyValueMap} template - data to be converted
     * @param {KeyValueMap} context - reference data for resolving the template
     * @returns {Node | undefined} the resolved results
     */
    DOMTemplateRenderer.prototype.resolveTemplate = function (template, context) {
        return this.resolver.resolveValue(template, context);
    };
    /**
     * Tries to convert untyped data to a DOMNodeShorthand.
     * @param {unknown} source - data to be converted
     * @returns {DOMNodeShorthand | undefined} the resulting shorthand, if successful
     */
    DOMTemplateRenderer.prototype.extractShorthand = function (source) {
        switch (typeof source) {
            case 'object': {
                if (source != null) {
                    // Return as DOMFragmentShorthand
                    if (Array.isArray(source)) {
                        return {
                            content: this.extractShorthandContent(source)
                        };
                    }
                    // Return as DOMElementShorthand
                    if ('tag' in source) {
                        var element = {
                            tag: String(source.tag)
                        };
                        if ('attributes' in source) {
                            element.attributes = this.extractShorthandAttributes(source.attributes);
                        }
                        if ('content' in source && Array.isArray(source.content)) {
                            element.content = this.extractShorthandContent(source.content);
                        }
                        return element;
                    }
                    // Return as DOMAttributeShorthand
                    if ('name' in source && 'value' in source) {
                        return {
                            name: String(source.name),
                            value: source.value != null ? String(source.value) : null
                        };
                    }
                    // Return as DOMCDataShorthand
                    if ('cData' in source) {
                        return {
                            cData: this.stringify(source.cData)
                        };
                    }
                    // Return as DOMCommentShorthand
                    if ('comment' in source) {
                        return {
                            comment: this.stringify(source.comment)
                        };
                    }
                    // Return as DOMProcessingInstructionShorthand
                    if ('target' in source && 'data' in source) {
                        return {
                            target: String(source.target),
                            data: this.stringify(source.data)
                        };
                    }
                    // Return as DOMFragmentShorthand
                    if ('content' in source && Array.isArray(source.content)) {
                        return {
                            content: this.extractShorthandContent(source.content)
                        };
                    }
                }
                break;
            }
            case 'string': {
                return source;
            }
            default: {
                return String(source);
            }
        }
    };
    /**
     * Applies untyped data to a DOMNodeShorthand conversion to array items, filtering out failed conversions.
     * @param {unknown[]} source - array whose contents are to be converted
     * @returns {DOMNodeShorthand[]} an array of successfully converted items
     */
    DOMTemplateRenderer.prototype.extractShorthandContent = function (source) {
        var _this = this;
        var items = source.map(function (item) { return _this.extractShorthand(item); });
        var filtered = items.filter(function (value) { return value !== undefined; });
        return filtered;
    };
    /**
     * Extracts an attribute map from untyped data.
     * @param {unknown} source - data to be evaluated
     * @returns {Record<string, string>} extracted attribute map
     */
    DOMTemplateRenderer.prototype.extractShorthandAttributes = function (source) {
        if (typeof source === 'object' && source != null && !Array.isArray(source)) {
            var valueMap = source;
            var results = {};
            for (var key in valueMap) {
                var value = valueMap[key];
                results[key] = this.stringify(value);
            }
            return results;
        }
        return {};
    };
    /**
     * Converts untyped data to string, trying to preserve object data in doing so.
     * @param {unknown} source - data to be converted
     * @returns {string} the resulting string
     */
    DOMTemplateRenderer.prototype.stringify = function (source) {
        return typeof source === 'object' && source != null
            ? JSON.stringify(source)
            : String(source);
    };
    return DOMTemplateRenderer;
}());
exports.DOMTemplateRenderer = DOMTemplateRenderer;
/**
 * A DOMTemplateRenderer with it's own template property so it can render with just a context.
 * @property {DOMNodeShorthandTemplate} template - template to use when no other is specified
 */
var ContextRenderer = /** @class */ (function (_super) {
    __extends(ContextRenderer, _super);
    function ContextRenderer(template, resolver) {
        if (template === void 0) { template = {}; }
        if (resolver === void 0) { resolver = exports.DEFAULT_TEMPLATE_RESOLVER; }
        var _this = _super.call(this, resolver) || this;
        _this.template = template;
        return _this;
    }
    /**
     * Tries to generate a Node for a given context.
     * @param {KeyValueMap} context - data to be used for Node generation
     * @returns {DOMNodeShorthand | undefined} the resulting node
     */
    ContextRenderer.prototype.renderContext = function (context) {
        var resolved = this.resolveContextView(context);
        var shorthand = this.extractShorthand(resolved);
        if (shorthand != null) {
            return this.renderShorthand(shorthand);
        }
    };
    /**
     * Generates raw display data for the provided context.  This needs to passed through extractShorthand to ensure proper formatting.
     * @param {KeyValueMap} context - data to be used for display data generation
     * @returns {unknown} the resulting display data
     */
    ContextRenderer.prototype.resolveContextView = function (context) {
        return this.resolver.resolveValue(this.template, context);
    };
    return ContextRenderer;
}(DOMTemplateRenderer));
exports.ContextRenderer = ContextRenderer;
exports.DEFAULT_DATA_KEY = 'data';
/**
 * A specialized ContextRenderer that lets you separate utility functions and constants from the data to be rendered.
 * @property {KeyValueMap} baseContext - provides default context values
 * @property {string} dataKey - key used to attach passed in data to the context
 */
var DataRenderer = /** @class */ (function (_super) {
    __extends(DataRenderer, _super);
    function DataRenderer(template, baseContext, dataKey, resolver) {
        if (template === void 0) { template = {}; }
        if (baseContext === void 0) { baseContext = {}; }
        if (dataKey === void 0) { dataKey = exports.DEFAULT_DATA_KEY; }
        if (resolver === void 0) { resolver = exports.DEFAULT_TEMPLATE_RESOLVER; }
        var _this = _super.call(this, template, resolver) || this;
        _this.baseContext = baseContext;
        _this.dataKey = dataKey;
        return _this;
    }
    /**
     * Tries to generate a Node for a given data map.
     * @param {KeyValueMap} data - data to be used for Node generation
     * @returns {DOMNodeShorthand | undefined} the resulting node
     */
    DataRenderer.prototype.renderData = function (data) {
        var resolved = this.resolveDataView(data);
        var shorthand = this.extractShorthand(resolved);
        if (shorthand != null) {
            return this.renderShorthand(shorthand);
        }
    };
    /**
     * Generates raw display data from the provided data.  This needs to passed through extractShorthand to ensure proper formatting.
     * @param {KeyValueMap} data - data to be used for display data generation
     * @returns {unknown} the resulting display data
     */
    DataRenderer.prototype.resolveDataView = function (data) {
        var context = __assign({}, this.baseContext);
        if (this.dataKey.length > 0) {
            context[this.dataKey] = data;
        }
        else {
            Object.assign(context, data);
        }
        return this.resolver.resolveValue(this.template, context);
    };
    return DataRenderer;
}(ContextRenderer));
exports.DataRenderer = DataRenderer;
