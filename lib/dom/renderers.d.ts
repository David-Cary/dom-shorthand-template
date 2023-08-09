import { KeyedTemplateResolver, type KeyValueMap, type KeyedValueTemplate, type ReplacableValue } from 'keyed-value-templates';
import { type DOMNodeShorthand, type DOMElementShorthand, type DOMAttributeShorthand, type DOMCDataShorthand, type DOMProcessingInstructionShorthand, type DOMCommentShorthand, type DOMFragmentShorthand } from 'dom-shorthand';
/**
 * Lets all DOMNodeShorthand types use directive requests.
 */
export type DOMNodeShorthandTemplate = (ReplacableValue<string> | KeyedValueTemplate<DOMElementShorthand | DOMAttributeShorthand | DOMCDataShorthand | DOMProcessingInstructionShorthand | DOMCommentShorthand | DOMFragmentShorthand>);
export declare const DEFAULT_TEMPLATE_RESOLVER: KeyedTemplateResolver;
/**
 * Provides utility functions for generating DOM nodes from a given template and context.
 * @property {KeyedTemplateResolver} resolver - used to resolve the template to a context specific state
 */
export declare class DOMTemplateRenderer {
    readonly resolver: KeyedTemplateResolver;
    constructor(resolver?: KeyedTemplateResolver);
    /**
     * Tries to the template to a DOM node for the given context.
     * @param {KeyValueMap} template - data to be converted
     * @param {KeyValueMap} context - reference data for converting the template
     * @returns {Node | undefined} the resulting node, if the template resolved to a valid shorthand
     */
    renderTemplate(template: DOMNodeShorthandTemplate, context: KeyValueMap): Node | undefined;
    /**
     * Tries to create a DOM node from a given shorthand.
     * @param {DOMNodeShorthand} shorthand - data to be converted
     * @returns {Node | undefined} the resulting node
     */
    renderShorthand(shorthand: DOMNodeShorthand): Node | undefined;
    /**
     * Retrieves a version of the template's data with alll directives applied for the given context.
     * @param {KeyValueMap} template - data to be converted
     * @param {KeyValueMap} context - reference data for resolving the template
     * @returns {Node | undefined} the resolved results
     */
    resolveTemplate(template: DOMNodeShorthandTemplate, context: KeyValueMap): unknown;
    /**
     * Tries to convert untyped data to a DOMNodeShorthand.
     * @param {unknown} source - data to be converted
     * @returns {DOMNodeShorthand | undefined} the resulting shorthand, if successful
     */
    extractShorthand(source: unknown): DOMNodeShorthand | undefined;
    /**
     * Applies untyped data to a DOMNodeShorthand conversion to array items, filtering out failed conversions.
     * @param {unknown[]} source - array whose contents are to be converted
     * @returns {DOMNodeShorthand[]} an array of successfully converted items
     */
    extractShorthandContent(source: unknown[]): DOMNodeShorthand[];
    /**
     * Extracts an attribute map from untyped data.
     * @param {unknown} source - data to be evaluated
     * @returns {Record<string, string>} extracted attribute map
     */
    extractShorthandAttributes(source: unknown): Record<string, string>;
    /**
     * Converts untyped data to string, trying to preserve object data in doing so.
     * @param {unknown} source - data to be converted
     * @returns {string} the resulting string
     */
    stringify(source: unknown): string;
}
/**
 * A DOMTemplateRenderer with it's own template property so it can render with just a context.
 * @property {DOMNodeShorthandTemplate} template - template to use when no other is specified
 */
export declare class ContextRenderer extends DOMTemplateRenderer {
    template: DOMNodeShorthandTemplate;
    constructor(template?: DOMNodeShorthandTemplate, resolver?: KeyedTemplateResolver);
    /**
     * Tries to generate a Node for a given context.
     * @param {KeyValueMap} context - data to be used for Node generation
     * @returns {DOMNodeShorthand | undefined} the resulting node
     */
    renderContext(context: KeyValueMap): Node | undefined;
    /**
     * Generates raw display data for the provided context.  This needs to passed through extractShorthand to ensure proper formatting.
     * @param {KeyValueMap} context - data to be used for display data generation
     * @returns {unknown} the resulting display data
     */
    resolveContextView(context: KeyValueMap): unknown;
}
export declare const DEFAULT_DATA_KEY = "data";
/**
 * A specialized ContextRenderer that lets you separate utility functions and constants from the data to be rendered.
 * @property {KeyValueMap} baseContext - provides default context values
 * @property {string} dataKey - key used to attach passed in data to the context
 */
export declare class DataRenderer extends ContextRenderer {
    baseContext: KeyValueMap;
    dataKey: string;
    constructor(template?: DOMNodeShorthandTemplate, baseContext?: KeyValueMap, dataKey?: string, resolver?: KeyedTemplateResolver);
    /**
     * Tries to generate a Node for a given data map.
     * @param {KeyValueMap} data - data to be used for Node generation
     * @returns {DOMNodeShorthand | undefined} the resulting node
     */
    renderData(data: KeyValueMap): Node | undefined;
    /**
     * Generates raw display data from the provided data.  This needs to passed through extractShorthand to ensure proper formatting.
     * @param {KeyValueMap} data - data to be used for display data generation
     * @returns {unknown} the resulting display data
     */
    resolveDataView(data: KeyValueMap): unknown;
}
