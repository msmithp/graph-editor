import type { Edge, Graph, Vertex } from "../types/Graph";
import type { GraphJSON, TikzExportSettings } from "../types/IO";
import { HEIGHT } from "./constants";
import { 
    angleBetweenPoints, angleBetweenVertices, bestFittingAngle,
    degreesToRadians, directionMagnitudeToComponents, getDistanceScalar,
    invertYAxis, radiansToDegrees, scaleCoordinates, trimPadding
} from "./graphicsUtils";
import { createDoubleAdjacencyGraph, getEdgeIterator } from "./graphUtils";
import { getNBetween, hexToRgb, squeeze } from "./utils";

/** 
 * Number of digits after the decimal place to display for numbers in TikZ
 * output 
 */
const NUM_DIGITS = 2;

/**
 * Export a graph to TikZ (LaTeX) code
 * @param graph Graph
 * @param settings TikZ export settings
 * @returns TikZ (LaTeX) code to draw graph
 */
export function toTikz(graph: Graph, settings: TikzExportSettings): string {
    let tikzGraph = invertYAxis(graph, HEIGHT);
    tikzGraph = scaleCoordinates(tikzGraph, 0.01);

    if (settings.trimPadding) {
        tikzGraph = trimPadding(tikzGraph);
    }

    let output = "\\begin{tikzpicture}";

    if (settings.coordinateScale !== null) {
        output += "[scale=" + settings.coordinateScale + "]\n";
    }
    
    // Vertices
    output += getTikzVertices(tikzGraph, settings);

    // Edges
    output += getTikzEdges(tikzGraph, settings);

    output += "\\end{tikzpicture}";
    return output;
}

/**
 * Get a string for the options within a scope block for the vertices of a TikZ
 * graph based on export settings
 * @param settings TikZ export settings
 * @returns TikZ scope block options
 */
function getTikzVertexScope(settings: TikzExportSettings): string {
    let scopeStr = "every node/.style={";

    switch (settings.vertexStyle) {
        case "DOT":
            scopeStr += "circle,fill=black";
            break;
        case "TEXT":
            scopeStr += "circle";
            break;
        default:
            scopeStr += "draw,circle";
            break;
    }

    scopeStr += "}";

    return scopeStr;
}

/**
 * Get a string for the options within a scope block for the edges of a TikZ
 * graph based on export settings
 * @param settings TikZ export settings
 * @returns TikZ scope block options
 */
function getTikzEdgeScope(settings: TikzExportSettings): string {
    let nodeStyle = "every node/.style={";

    if (settings.slopedEdgeWeight) {
        nodeStyle += "sloped,";
    }

    if (settings.edgeWeightStyle === "INSIDE") {
        nodeStyle += "fill=white,"
    }

    nodeStyle += "}";

    let pathStyle = "every path/.style={line width=" + settings.edgeWidth 
                  + "}";

    return nodeStyle + "," + pathStyle;
}

/**
 * Create TikZ nodes for the vertices of a graph
 * @param graph Graph
 * @param settings TikZ export settings
 * @returns Scope block containing all vertices as TikZ nodes
 */
function getTikzVertices(graph: Graph, settings: TikzExportSettings): string {
    const vertexLabelAngles = getTikzVertexLabelPlacementAngles(graph, 
        settings, true).map(radiansToDegrees);

    let output = "\t\\begin{scope}[" + getTikzVertexScope(settings) + "]\n";

    for (let i = 0; i < graph.vertices.length; i++) {
        const v = graph.vertices[i];
        const x = v.pos.x.toFixed(NUM_DIGITS);
        const y = v.pos.y.toFixed(NUM_DIGITS);
        let vertexStr = "\t\t\\node[";

        // Only draw fill color for DOT and STANDARD styles
        if (settings.vertexStyle === "DOT"
            || settings.vertexStyle === "STANDARD") {
            // If using the dot style, pure white vertices are given no fill
            // so they default to black, making them visible
            if (!(settings.vertexStyle === "DOT" && v.color === "#FFFFFF")) {
                const rgb = hexToRgb(v.color);
                const fill = "{rgb,255:red," + rgb[0] + ";"
                           + "green,"        + rgb[1] + ";"
                           + "blue,"         + rgb[2] + "}";
                vertexStr += "fill=" + fill + ',';
            }
        }

        if (!settings.showVertexLabels) {
            // Finish vertex string with no label
            vertexStr += "] (" + i + ") at (" + x + "," + y +  ") {};";
        } else if (v.label !== "") {
            const label = settings.textFormat === "MATH" ?
                "$" + v.label + "$" : v.label;
            if (settings.vertexStyle === "DOT") {
                // Label must go outside the vertex
                vertexStr += "label={" + vertexLabelAngles[i] + ":" + label
                          +  "}] (" + i + ") at (" + x + "," + y + ") {};";
            } else {
                // Otherwise, label goes inside the vertex
                vertexStr += "] (" + i + ") at (" + x + "," + y +  ") {"
                          +  label + "};";
            }
        }

        output += vertexStr + '\n';
    }

    output += "\t\\end{scope}\n";

    return output;
}

function getTikzVertexLabelPlacementAngles(graph: Graph,
    settings: TikzExportSettings, isYAxisInverted: boolean): number[] {
    const doubleAdjacencyGraph = isYAxisInverted ? (
        createDoubleAdjacencyGraph(invertYAxis(graph, HEIGHT))
    ) : (
        createDoubleAdjacencyGraph(graph)
    );
    
    const allAngles: number[][] = new Array(
        doubleAdjacencyGraph.vertices.length
    );

    for (let i = 0; i < doubleAdjacencyGraph.vertices.length; i++) {
        const v1 = doubleAdjacencyGraph.vertices[i];
        const p1 = v1.pos;
        const angles = [];

        for (const [j, edges] of doubleAdjacencyGraph.edges[i].entries()) {
            const v2 = doubleAdjacencyGraph.vertices[j];
            const p2 = v2.pos;

            if (edges.length === 0) {
                // No ij edges - ignore
                continue;
            } else if (edges.length === 1) {
                // One ij edge - get simple angle between points
                angles.push(angleBetweenPoints(p1, p2));
            } else {
                // Many ij edges - get TikZ edge bends and calculate angles of
                // outgoing multi-edges
                const angle = angleBetweenPoints(p1, p2);
                const outgoing = getTikzEdgeBends(edges, settings).map(bend => 
                    // Add 2pi to account for potentially negative angles
                    (2 * Math.PI 
                        // Bends refer to amount moved clockwise from `angle`,
                        // so subtract it from `angle` to get the angle at
                        // which it leaves the vertex
                        + (angle - degreesToRadians(bend)))
                        % (2 * Math.PI)
                );

                angles.push(...outgoing);
            }
        }

        allAngles[i] = angles;
    }

    const sortedAngles = allAngles.map(arr => arr.sort());
    return sortedAngles.map(bestFittingAngle);
}

/**
 * Create TikZ paths for the edges of a graph
 * @param graph Graph
 * @param settings TikZ export settings
 * @returns Scope block containing all edges as TikZ paths
 */
function getTikzEdges(graph: Graph, settings: TikzExportSettings): string {
    let output = "\t\\begin{scope}[" + getTikzEdgeScope(settings) + "]\n";
    
    getEdgeIterator(graph).forEach(([v1, v2], edges) => {
        const bends = getTikzEdgeBends(edges.map(e => e.edge), settings);

        for (let i = 0; i < edges.length; i++) {
            const edgeInfo = edges[i];
            let edgeStr = "\t\t\\path";

            const reversed = edgeInfo.source !== v1;

            if (settings.isDirected) {
                edgeStr += reversed ? "[<-]" : "[->]";
            }

            edgeStr += " (" + v1 + ") edge";

            if (bends.length >= 2) {
                edgeStr += "[bend right=" + bends[i] + ']';
            }

            if (edgeInfo.edge.weight !== "") {
                const weightShift = getTikzEdgeWeightShift(graph.vertices[v1],
                    graph.vertices[v2], edgeInfo.edge, settings);

                const xshift = weightShift.xshift.toFixed(NUM_DIGITS);
                const yshift = weightShift.yshift.toFixed(NUM_DIGITS);

                // For multiedges, draw the second half of edges (inclusive)
                // on the opposite side of the edge
                const isInSecondHalf = i >= Math.ceil(edges.length / 2);
                if (isInSecondHalf) {
                    edgeStr += " node[xshift=" + (-xshift) + "pt,"
                            +  "yshift=" + (-yshift) + "pt]";
                } else {
                    edgeStr += " node[xshift=" + xshift + "pt,"
                            +  "yshift=" + yshift + "pt]";
                }

                const weightLabel = settings.textFormat === "MATH" ?
                    '$' + edgeInfo.edge.weight + '$' : edgeInfo.edge.weight;

                edgeStr += '{' + weightLabel + '}';
            }

            edgeStr += " (" + v2 + ");";

            output += edgeStr + '\n';
        }
    });

    output += "\t\\end{scope}\n";

    return output;
}

/**
 * Get a list of edge bends between 15 and 90 for some given edges to be drawn
 * on a TikZ graph
 * @param edges Number of edges between vertices
 * @param settings TikZ export settings
 * @returns List of edge bends
 */
function getTikzEdgeBends(edges: Edge[], settings: TikzExportSettings): number[] {
    const numEdges = edges.length;

    if (numEdges == 0) {
        return []
    } else if (numEdges == 1) {
        return [0]
    } else {
        const base = 15;
        const perChar = 8;
        const maxLength = Math.max(...edges.map(e => e.weight.length));
        let maxBend;

        if (settings.edgeWeightStyle === "INSIDE"
            && settings.slopedEdgeWeight) {
            // Sloped weights, inside edges
            const angleDiff = base + numEdges * 8;
            maxBend = squeeze(angleDiff, 15, 90);
        } else if (settings.edgeWeightStyle === "INSIDE") {
            // Non-sloped weights, inside edges
            const angleDiff = base + (numEdges * (perChar/2) * maxLength)
            maxBend = squeeze(angleDiff, 15, 90);
        } else {
            // Non-sloped weights, outside edges
            const angleDiff = base + (numEdges * perChar * maxLength)
            maxBend = squeeze(angleDiff, 15, 90);
        }

        return getNBetween(-maxBend, maxBend, numEdges);
    }
}

/**
 * Get the x- and y-shift values for an edge weight to be drawn on a TikZ graph
 * @param v1 Source vertex
 * @param v2 Destination vertex
 * @param edge Edge
 * @param settings TikZ export settings
 * @returns x- and y-shift values for an edge weight
 */
function getTikzEdgeWeightShift(v1: Vertex, v2: Vertex, 
    edge: Edge, settings: TikzExportSettings
): { xshift: number, yshift: number } {
    // Minimum distance away from an edge that weight should be
    const BASE_MAGNITUDE = 5;

    if (settings.edgeWeightStyle === "INSIDE") {
        return { xshift: 0, yshift: 0 };
    } else if (settings.edgeWeightStyle === "OUTSIDE" 
               && settings.slopedEdgeWeight) {
        return { xshift: 0, yshift: BASE_MAGNITUDE };
    }
    
    // Get angle perpendicular to the angle between v1 and v2
    const angle = angleBetweenVertices(v1, v2, false);
    const perpendicularAngle = (angle + Math.PI/2) % (2 * Math.PI);

    // Get distance from middle of edge for edge weight
    const LENGTH_MULTIPLIER = 2.2;
    const c = getDistanceScalar(v1.pos, v2.pos);
    const magnitude = BASE_MAGNITUDE 
                    + (edge.weight.length * LENGTH_MULTIPLIER) * c;

    const vec = directionMagnitudeToComponents(perpendicularAngle, magnitude);
    const xshift = vec.x;
    const yshift = vec.y;

    return {
        xshift: xshift,
        yshift: yshift
    };
}

export function toVertexEdgeList(graph: Graph): string {

}

export function fromVertexEdgeList(list: string): Graph {

}

export function toJson(graph: Graph): GraphJSON {

}

export function fromJson(graphJson: GraphJSON): Graph {

}

