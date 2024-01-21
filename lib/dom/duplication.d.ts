import { type KeyedTemplateDirective, type KeyedTemplateResolver, type KeyValueMap } from 'keyed-value-templates';
import { type DOMNodeShorthandTemplate } from './renderers';
/**
 * Creates a copy of the target DOM node shorthand with the target attributes removed from it as well as all it's children and contents.
 * @function
 * @param {Record<string, any>} source - object to be copied
 * @param {string[]} exclusions - attributes to be removed
 * @returns {DOMNodeShorthandTemplate}
 */
export declare function omitNestedAttributes(source: DOMNodeShorthandTemplate, exclusions: string[]): DOMNodeShorthandTemplate;
/**
 * Creates a copy of the target object with the listed properties excluded.
 * @function
 * @param {Record<string, any>} source - object to be copied
 * @param {string[]} exclusions - properties to be removed
 * @returns {Record<string, any>}
 */
export declare function omitProperties(source: Record<string, any>, exclusions: string[]): Record<string, any>;
/**
 * Describes how content should be copied and how the copy should be modified.
 * @interface
 * @property {any} source - value to be copied or template to be used
 * @property {Record<string, any> | undefined} attributes - values to overwrite in the target element's attributes
 * @property {Record<string, any> | undefined} data - local variables to use when resolving the provided template
 */
export interface ContentDuplicationParameters {
    source: any;
    attributes?: Record<string, any>;
    data?: Record<string, any>;
}
/**
 * Creates a copy of the provided element shorthand with it's id attribute cleared.
 * This also lets you override specified attributes and set local variables before resolving that elements template.
 * @class
 * @implements {KeyedTemplateDirective<ContentDuplicationParameters, any>}
 */
export declare class ContentDuplicationDirective implements KeyedTemplateDirective<ContentDuplicationParameters, any> {
    processParams(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): ContentDuplicationParameters;
    execute(params: KeyValueMap, context: KeyValueMap, resolver: KeyedTemplateResolver): unknown;
    resolveCopy(source: any, context: KeyValueMap, resolver: KeyedTemplateResolver, data?: Record<string, any>): any;
    cloneNamedContent(source: DOMNodeShorthandTemplate, attributes?: Record<string, any>): DOMNodeShorthandTemplate;
}
