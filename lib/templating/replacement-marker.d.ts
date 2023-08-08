export interface ReplacementMarker {
    $use: unknown;
}
export type ReplacementMarkerResolver = (marker: ReplacementMarker, context: Record<string, unknown>) => unknown;
export declare function resolveTypedReplacementMarker<T>(marker: ReplacementMarker, context: Record<string, unknown>, resolver: ReplacementMarkerResolver, formatter: (value: unknown) => T): T;
