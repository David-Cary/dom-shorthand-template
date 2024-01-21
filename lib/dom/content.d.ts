import { type KeyedTemplateDirective, type KeyedTemplateResolver, type KeyValueMap, type ValueWrapper } from 'keyed-value-templates';
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
    nullishText: string;
    stringQuote: string;
    viaJSON: boolean;
    replacer: any;
    space: number | string;
    depth: number;
}
export declare function getValueText(value: any, options?: Partial<ValueTextOptions>, visited?: any[]): string;
export declare function getObjectText(source: Record<string, any> | any[], options?: Partial<ValueTextOptions>, visited?: any[]): string;
/**
 * Alters how an untyped value should be converted to text.
 * @interface
 * @extends ValueWrapper<any>
 * @property {Partial<ValueTextOptions> | undefinecd} options - text conversion options to use on the target value
 */
export interface ValueTextParameters extends ValueWrapper<any> {
    options?: Partial<ValueTextOptions>;
}
/**
 * Utility directive for converting a value to a text string.
 * @class
 */
export declare class ValueTextDirective implements KeyedTemplateDirective<ValueTextParameters, any> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ValueTextParameters;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
/**
 * Utility directive for converting a value to an array containing a single text string.
 * @class
 */
export declare class WrappedValueTextDirective extends ValueTextDirective {
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
}
