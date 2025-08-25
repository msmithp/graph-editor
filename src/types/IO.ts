import type { Edge, Vertex } from "./Graph"

export interface TikzExportSettings {
    // Whether to draw vertices as a circle with label in the center, as a dot
    // with label outside, or simply as text
    vertexStyle: "STANDARD" | "DOT" | "TEXT",

    // Whether to show or hide vertex labels
    showVertexLabels: boolean,

    // Whether to draw edge weights inside or outside edge path
    edgeWeightStyle: "INSIDE" | "OUTSIDE",

    // Whether to slope edge weights with the angle of the edge
    slopedEdgeWeight: boolean,

    // Whether to include directional arrows on edges
    isDirected: boolean,

    // Line width of edges, in pts
    edgeWidth: number,

    // Whether to render vertex labels and edge weights as plain text or as
    // math (i.e., encased in dollar signs)
    textFormat: "TEXT" | "MATH",

    // Whether to trim coordinates such that the leftmost coordinate has x=0
    // and the topmost coordinate has y=0, or keep coordinates the same
    trimPadding: boolean,

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