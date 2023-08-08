"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTypedReplacementMarker = void 0;
function resolveTypedReplacementMarker(marker, context, resolver, formatter) {
    var value = resolver(marker, context);
    var formatted = formatter(value);
    return formatted;
}
exports.resolveTypedReplacementMarker = resolveTypedReplacementMarker;
