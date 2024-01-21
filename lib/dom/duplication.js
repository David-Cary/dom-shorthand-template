"use strict";
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
exports.ContentDuplicationDirective = exports.omitProperties = exports.omitNestedAttributes = void 0;
/**
 * Creates a copy of the target DOM node shorthand with the target attributes removed from it as well as all it's children and contents.
 * @function
 * @param {Record<string, any>} source - object to be copied
 * @param {string[]} exclusions - attributes to be removed
 * @returns {DOMNodeShorthandTemplate}
 */
function omitNestedAttributes(source, exclusions) {
    if (typeof source === 'object' && source != null) {
        var copy = __assign({}, source);
        if ('attributes' in source) {
            copy.attributes = omitProperties(source.attributes, exclusions);
        }
        if ('content' in source && Array.isArray(source.content)) {
            copy.content = source.content.map(function (item) { return omitNestedAttributes(item, exclusions); });
        }
        return copy;
    }
    return source;
}
exports.omitNestedAttributes = omitNestedAttributes;
/**
 * Creates a copy of the target object with the listed properties excluded.
 * @function
 * @param {Record<string, any>} source - object to be copied
 * @param {string[]} exclusions - properties to be removed
 * @returns {Record<string, any>}
 */
function omitProperties(source, exclusions) {
    var copy = {};
    for (var key in source) {
        if (exclusions.includes(key))
            continue;
        copy[key] = source[key];
    }
    return copy;
}
exports.omitProperties = omitProperties;
/**
 * Creates a copy of the provided element shorthand with it's id attribute cleared.
 * This also lets you override specified attributes and set local variables before resolving that elements template.
 * @class
 * @implements {KeyedTemplateDirective<ContentDuplicationParameters, any>}
 */
var ContentDuplicationDirective = /** @class */ (function () {
    function ContentDuplicationDirective() {
    }
    ContentDuplicationDirective.prototype.processParams = function (params, context, resolver) {
        return {
            source: resolver.resolveValue(params.source, context),
            attributes: resolver.resolveTypedValue(params.attributes, context, function (value) {
                if (typeof value === 'object' && value != null) {
                    return value;
                }
            }),
            data: resolver.resolveTypedValue(params.data, context, function (value) {
                if (value != null) {
                    return typeof value === 'object'
                        ? value
                        : { value: value };
                }
            })
        };
    };
    ContentDuplicationDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        if (spec.source != null) {
            var resolvedCopy = this.resolveCopy(spec.source, context, resolver, spec.data);
            var renamedCopy = this.cloneNamedContent(resolvedCopy, spec.attributes);
            return renamedCopy;
        }
    };
    ContentDuplicationDirective.prototype.resolveCopy = function (source, context, resolver, data) {
        if (data != null) {
            var localContext = resolver.createLocalContext(context);
            for (var key in data) {
                resolver.setLocalValue(localContext, key, data[key]);
            }
            var value_1 = resolver.resolveValue(source, localContext);
            return value_1;
        }
        var value = resolver.resolveValue(source, context);
        return value;
    };
    ContentDuplicationDirective.prototype.cloneNamedContent = function (source, attributes) {
        var copy = omitNestedAttributes(source, ['id']);
        if (typeof copy === 'object' &&
            'tag' in copy &&
            attributes != null) {
            if (copy.attributes != null) {
                Object.assign(copy.attributes, attributes);
            }
            else {
                copy.attributes = __assign({}, attributes);
            }
        }
        return copy;
    };
    return ContentDuplicationDirective;
}());
exports.ContentDuplicationDirective = ContentDuplicationDirective;
