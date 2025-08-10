import type { Edge, Vertex } from "./Graph"

export interface LatexExportSettings {
    // Whether to draw vertices as a circle with label in the center, as a dot
    // with label outside, or simply as text
    vertexStyle: "STANDARD" | "DOT" | "TEXT",

    // Whether to show or hide vertex labels
    vertexLabels: "SHOW" | "HIDE",

    // Whether to render vertex labels as plain text or as math (i.e., encased
    // in dollar signs)
    vertexLabelFormat: "TEXT" | "MATH",

    // Whether to keep coordinate system as-is, or trim coordinates such that
    // the leftmost coordinate has x=0 and the topmost coordinate has y=0
    padding: "KEEP" | "TRIM",

    // Amount by which to scale coordinate system (null for no scale)
    coordinateScale: number | null,
}

export interface GraphJSON {
    vertices: Vertex[],
    edges: {
        source: Vertex,
        destination: Vertex,
        edge: Edge
    }[]
}