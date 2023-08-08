import { KeyedTemplateResolver, type KeyValueMap } from 'keyed-value-templates';
import { type DOMNodeShorthand } from 'dom-shorthand';
export declare const DEFAULT_TEMPLATE_RESOLVER: KeyedTemplateResolver;
export declare class DOMTemplateRenderer {
    readonly resolver: KeyedTemplateResolver;
    constructor(resolver?: KeyedTemplateResolver);
    renderTemplate(template: KeyValueMap, context: KeyValueMap): Node | undefined;
    renderShorthand(shorthand: DOMNodeShorthand): Node | undefined;
    resolveTemplate(template: KeyValueMap, context: KeyValueMap): unknown;
    extractShorthand(source: unknown): DOMNodeShorthand | undefined;
    extractShorthandContent(source: unknown[]): DOMNodeShorthand[];
    extractShorthandAttributes(source: unknown): Record<string, string>;
    stringify(source: unknown): string;
}
export declare class ContextRenderer extends DOMTemplateRenderer {
    template: KeyValueMap;
    constructor(template?: KeyValueMap, resolver?: KeyedTemplateResolver);
    renderContext(context: KeyValueMap): Node | undefined;
    resolveContextDisplay(context: KeyValueMap): unknown;
}
export declare const DEFAULT_DATA_KEY = "data";
export declare class DataRenderer extends ContextRenderer {
    baseContext: KeyValueMap;
    dataKey: string;
    constructor(template?: KeyValueMap, baseContext?: KeyValueMap, dataKey?: string, resolver?: KeyedTemplateResolver);
    renderData(data: KeyValueMap): Node | undefined;
    resolveDataDisplay(data: KeyValueMap): unknown;
}
