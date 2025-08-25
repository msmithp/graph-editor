import type { Edge, Graph, Vertex } from "../types/Graph";
import type { GraphJSON, TikzExportSettings } from "../types/IO";
import { HEIGHT } from "./constants";
import { 
    angleBetweenVertices, directionMagnitudeToComponents,
    getVertexLabelPlacementAngles, invertYAxis, trimPadding
} from "./graphicsUtils";
import { getEdgeIterator } from "./graphUtils";
import { getNBetween, hexToRgb, squeeze } from "./utils";

/**
 * Export a graph to TikZ (LaTeX) code
 * @param graph Graph
 * @param settings TikZ export settings
 * @returns TikZ (LaTeX) code to draw graph
 */
export function toTikz(graph: Graph, settings: TikzExportSettings): string {
    let tikzGraph = invertYAxis(graph, HEIGHT);

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

function getTikzEdgeScope(settings: TikzExportSettings): string {
    let nodeStyle = "every node/.style={";

    nodeStyle += "}";

    let pathStyle = "every path/.style={line width=" + settings.edgeWidth 
                  + "}";

    return nodeStyle + "," + pathStyle;
}

function getTikzVertices(graph: Graph, settings: TikzExportSettings): string {
    const vertexLabelAngles = getVertexLabelPlacementAngles(graph);

    let output = "\t\\begin{scope}[" + getTikzVertexScope(settings) + "]\n";

    for (let i = 0; i < graph.vertices.length; i++) {
        const v = graph.vertices[i];
        let vertexStr = "\t\t\\node[";

        // Only draw fill color for DOT and STANDARD styles
        if (settings.vertexStyle === "DOT"
            || settings.vertexStyle === "STANDARD") {  
            // Convert hex code to RGB
            const rgb = hexToRgb(v.color);
            const fill = "{rgb,255:red," + rgb[0] + ";"
                       + "green,"    + rgb[1] + ";"
                       + "blue,"     + rgb[2] + "}";
            vertexStr += "fill=" + fill;
        }

        if (!settings.showVertexLabels) {
            // Finish vertex string with no label
            vertexStr += "] (" + i + ") at (" + v.pos.x + "," + v.pos.y
                      +  ") {};";

            output += vertexStr;
            continue;
        }

        if (v.label !== "") {
            const label = settings.textFormat === "MATH" ?
                "$" + v.label + "$" : v.label;
            if (settings.vertexStyle === "DOT") {
                // Label must go outside the vertex
                vertexStr += ",label={" + vertexLabelAngles[i] + ":" + label + "}]"
                        +  " at (" + v.pos.x + "," + v.pos.y + ") {};";
            } else {
                // Otherwise, label goes inside the vertex
                vertexStr += "] (" + i + ") at (" + v.pos.x + "," + v.pos.y
                        +  ") {" + label + "};";
            }
        }

        output += vertexStr + "\n";
    }

    output += "\t\\end{scope}\n";

    return output;
}

function getTikzEdges(graph: Graph, settings: TikzExportSettings): string {
    let output = "\t\\begin{scope}[" + getTikzEdgeScope(settings) + "]\n";
    
    getEdgeIterator(graph).forEach(([v1, v2], edges, _) => {
        const bends = getTikzEdgeBends(edges.length);

        for (let i = 0; i < edges.length; i++) {
            const edgeInfo = edges[i];
            let edgeStr = "\t\t\\path";

            if (settings.isDirected) {
                const arrowStr = edgeInfo.source === v1 ? "->" : "<-";
                edgeStr += '[' + arrowStr + ']';
            }

            edgeStr += " (" + v1 + ") edge";

            if (bends.length >= 2) {
                edgeStr += "[ bend right=" + bends[i] + ']';
            }

            if (edgeInfo.edge.weight !== "") {
                const weightInfo = getTikzEdgeWeightInfo(graph.vertices[v1],
                graph.vertices[v2], edgeInfo.edge);
                edgeStr += " node[xshift=" + weightInfo.xshift + "pt,"
                        +  "yshift=" + weightInfo.yshift + "pt]";

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

function getTikzEdgeBends(numEdges: number): number[] {
    if (numEdges == 0) {
        return []
    } else if (numEdges == 1) {
        return [0]
    } else {
        const maxBend = squeeze(numEdges*10, 15, 90);
        return getNBetween(-maxBend, maxBend, numEdges);
    }    
}

function getTikzEdgeWeightInfo(v1: Vertex, v2: Vertex, 
    edge: Edge): { xshift: number, yshift: number } {
    // Get angle for edge weight label shift
    const angle = angleBetweenVertices(v1, v2, false);
    const perpendicularAngle = (angle + Math.PI/2) % (2 * Math.PI);

    // Get distance from middle of edge for edge weight
    const BASE_MAGNITUDE = 6;
    const LENGTH_MULTIPLIER = 2;
    const magnitude = BASE_MAGNITUDE + edge.weight.length * LENGTH_MULTIPLIER;

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

