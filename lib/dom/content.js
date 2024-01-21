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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrappedValueTextDirective = exports.ValueTextDirective = exports.getObjectText = exports.getValueText = void 0;
function getValueText(value, options, visited) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    if (visited === void 0) { visited = []; }
    if (options.viaJSON != null) {
        try {
            return JSON.stringify(value, options.replacer, options.space);
        }
        catch (error) {
            return String(error);
        }
    }
    switch (typeof value) {
        case 'string': {
            return options.stringQuote != null
                ? options.stringQuote + value + options.stringQuote
                : value;
        }
        case 'undefined': {
            return (_a = options.nullishText) !== null && _a !== void 0 ? _a : String(value);
        }
        case 'object': {
            if (value == null) {
                return (_b = options.nullishText) !== null && _b !== void 0 ? _b : String(value);
            }
            var text = getObjectText(value, options, visited);
            return text;
        }
        default: {
            return String(value);
        }
    }
}
exports.getValueText = getValueText;
function getObjectText(source, options, visited) {
    if (options === void 0) { options = {}; }
    if (visited === void 0) { visited = []; }
    if (visited.includes(source)) {
        return source.toLocaleString();
    }
    visited.push(source);
    var depth = options.depth != null ? options.depth + 1 : 0;
    var propOptions = {
        stringQuote: '"',
        space: options.space,
        depth: depth
    };
    var propertyOffset = '';
    var closingOffset = '';
    if (options.space != null) {
        var spaces = typeof options.space === 'number'
            ? ' '.repeat(options.space)
            : options.space;
        propertyOffset = '\n' + spaces.repeat(depth + 1);
        closingOffset = '\n' + spaces.repeat(depth);
    }
    if (Array.isArray(source)) {
        var text_1 = '[';
        for (var i = 0; i < source.length; i++) {
            if (i > 0)
                text_1 += ',';
            text_1 += propertyOffset + getValueText(source[i], propOptions, visited);
        }
        text_1 += closingOffset + ']';
        return text_1;
    }
    var valueGap = options.space != null ? ' ' : '';
    var text = '{';
    for (var key in source) {
        if (text.length > 1)
            text += ',';
        text += propertyOffset +
            "\"".concat(key, "\":") +
            valueGap +
            getValueText(source[key], propOptions, visited);
    }
    text += closingOffset + '}';
    return text;
}
exports.getObjectText = getObjectText;
/**
 * Utility directive for converting a value to a text string.
 * @class
 */
var ValueTextDirective = /** @class */ (function () {
    function ValueTextDirective() {
    }
    ValueTextDirective.prototype.processParams = function (params, context, resolver) {
        return {
            value: resolver.resolveValue(params.value),
            options: resolver.getValueMap(params.options)
        };
    };
    ValueTextDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var valueString = getValueText(spec.value, spec.options);
        return valueString;
    };
    return ValueTextDirective;
}());
exports.ValueTextDirective = ValueTextDirective;
/**
 * Utility directive for converting a value to an array containing a single text string.
 * @class
 */
var WrappedValueTextDirective = /** @class */ (function (_super) {
    __extends(WrappedValueTextDirective, _super);
    function WrappedValueTextDirective() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WrappedValueTextDirective.prototype.execute = function (params, context, resolver) {
        var spec = this.processParams(params, context, resolver);
        var valueString = getValueText(spec.value, spec.options);
        return [valueString];
    };
    return WrappedValueTextDirective;
}(ValueTextDirective));
exports.WrappedValueTextDirective = WrappedValueTextDirective;
