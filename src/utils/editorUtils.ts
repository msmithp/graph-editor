import { isInteger, roundToBase, squeeze } from "./utils.ts";
import type { Graph, Vertex, Edge } from "../types/Graph.ts";


/**
 * Given a graph, return a new graph with a new vertex added
 * @param graph Graph to be used as a base
 * @param x `x`-coordinate of new vertex
 * @param y `y`-coordinate of new vertex
 * @param label Label of new vertex
 * @param gridBase Grid base, if any, to round coordinates to
 * @returns New graph with vertex added
 */
export function createVertex(graph: Graph, x: number, y: number,
    label?: string, gridBase?: number): Graph {
    // Round to grid base, if necessary
    if (gridBase !== undefined) {
        x = roundToBase(x, gridBase);
        y = roundToBase(y, gridBase);
    }

    // Create new vertex
    const newVertex: Vertex = {
        xpos: x,
        ypos: y,
        label: label === undefined ? "" : label,
        color: "#FFFFFF"
    };

    // Return new graph with vertex added
    return {
        vertices: [...graph.vertices, newVertex],
        edges: graph.edges
    };
}

/**
 * Given a graph, return a new graph with a new edge added
 * @param graph Graph to be used as a base
 * @param source Source vertex
 * @param destination Destination vertex
 * @returns New graph with edge added
 */
export function createEdge(graph: Graph, source: Vertex, destination: Vertex) {
    if (source == destination) {
        // Prevent loops
        return graph;
    }

    const newEdge: Edge = {
        source: source,
        destination: destination,
        weight: "",
        color: "#000000"
    };

    return {
        vertices: graph.vertices,
        edges: [...graph.edges, newEdge]
    };
}

/**
 * Given a graph, return a new graph with a given vertex removed. If `v` is not
 * in the vertices of the graph, then the original graph is returned.
 * @param graph Graph to be used as a base
 * @param v Vertex to remove from `graph`
 * @returns New graph with `v` removed
 */
export function deleteVertex(graph: Graph, v: Vertex): Graph {
    // Get index of vertex to be removed
    const idx = graph.vertices.indexOf(v);

    if (idx === -1) {
        // Vertex doesn't exist in graph, so don't remove anything
        return graph;
    } else {
        // Delete vertex at specified index
        return deleteVertexFromIndex(graph, idx);
    }
}

/**
 * Given a graph, return a new graph with the vertex at a given index removed
 * @param graph Graph to be used as a base
 * @param idx Index of vertex to remove
 * @returns New graph with the vertex at `idx` removed
 */
export function deleteVertexFromIndex(graph: Graph, idx: number): Graph {
    // Get vertex to be removed
    const removedVertex = graph.vertices[idx];

    // Remove vertex from list of vertices
    const newVertices = graph.vertices;
    newVertices.splice(idx, 1);

    // Remove all edges incident with the removed vertex
    const newEdges = graph.edges.filter(e => e.source !== removedVertex 
                                      && e.destination !== removedVertex);

    // Return new graph
    return {
        vertices: newVertices,
        edges: newEdges
    };
}

/**
 * Given a graph, return a new graph with the edge at a given index removed
 * @param graph Graph to be used as a base
 * @param idx Index of edge to remove
 * @returns New graph with the edge at `idx` removed
 */
export function deleteEdgeFromIndex(graph: Graph, idx: number): Graph {
    return {
        vertices: graph.vertices,
        edges: graph.edges.filter((_, i) => i !== idx)
    };
}

/**
 * Given a graph, return a new graph with the label of a vertex at a given
 * index updated
 * @param graph Graph to be used as a base
 * @param idx Index of vertex whose label will be updated
 * @param label New label of vertex
 * @returns New graph with updated vertex label
 */
export function changeVertexLabel(graph: Graph, idx: number, label: string): Graph {
    const newVertices = graph.vertices;
    newVertices[idx].label = label;

    return {
        vertices: newVertices,
        edges: graph.edges
    };
}

/**
 * Given a graph, return a new graph with the color of a vertex at a given
 * index updated
 * @param graph Graph to be used as a base
 * @param idx Index of vertex whose color will be updated
 * @param color New color of vertex, as a hex code in the format `"#FFFFFF"`
 * @returns New graph with updated vertex color
 */
export function changeVertexColor(graph: Graph, idx: number, color: string): Graph {
    const newVertices = graph.vertices;
    newVertices[idx].color = color;

    return {
        vertices: newVertices,
        edges: graph.edges
    };
}

export function changeVertexLabelAndColor(graph: Graph, idx: number, label: string, color: string): Graph {
    const newVertices = graph.vertices;
    newVertices[idx].label = label;
    newVertices[idx].color = color;

    return {
        vertices: newVertices,
        edges: graph.edges
    };
}

/**
 * Given a graph, return a new graph with the weight of an edge at a given
 * index updated
 * @param graph Graph to be used as a base
 * @param idx Index of edge whose weight will be updated
 * @param weight New weight of edge
 * @returns New graph with updated edge weight
 */
export function changeEdgeWeight(graph: Graph, idx: number, weight: string): Graph {
    const newEdges = graph.edges;
    newEdges[idx].weight = weight;

    return {
        vertices: graph.vertices,
        edges: newEdges
    };
}

/**
 * Given a graph, return a new graph with the color of an edge at a given
 * index updated
 * @param graph Graph to be used as a base
 * @param idx Index of edge whose color will be updated
 * @param color New color of edge, as a hex code in the format `"#FFFFFF"`
 * @returns New graph with updated edge color
 */
export function changeEdgeColor(graph: Graph, idx: number, color: string): Graph {
    const newEdges = graph.edges;
    newEdges[idx].color = color;

    return {
        vertices: graph.vertices,
        edges: newEdges
    };
}

export function changeEdgeWeightAndColor(graph: Graph, idx: number, weight: string, color: string): Graph {
    const newEdges = graph.edges;
    newEdges[idx].weight = weight;
    newEdges[idx].color = color;

    return {
        vertices: graph.vertices,
        edges: newEdges
    };
}

/**
 * Given a graph, return a new graph with the location of a vertex at a given
 * index updated
 * @param graph Graph to be used as a base
 * @param idx Index of vertex whose location will be changed
 * @param x New `x`-coordinate of vertex
 * @param y New `y`-coordinate of vertex
 * @param width Width of viewport in which graph is displayed
 * @param height Height of viewport in which graph is displayed
 * @param gridBase Grid base, if any, to round new coordinates to
 * @returns New graph with updated vertex location
 */
export function changeVertexLocation(graph: Graph, idx: number, x: number, y: number,
    width?: number, height?: number, gridBase?: number): Graph {
    const newVertices = graph.vertices;
    let newX = x;
    let newY = y;

    if (width !== undefined) {
        // If width is defined, then ensure x is between 0 and width
        newX = squeeze(x, 0, width);
    }

    if (height !== undefined) {
        // If height is defined, then ensure y is between 0 and height
        newY = squeeze(y, 0, height);
    }

    if (gridBase !== undefined) {
        // If a grid base is provided, round the X and Y values to it
        newX = roundToBase(newX, gridBase);
        newY = roundToBase(newY, gridBase);
    }

    // Update x and y position of vertices
    newVertices[idx].xpos = newX;
    newVertices[idx].ypos = newY;

    // Return new graph with updated vertex location
    return {
        vertices: newVertices,
        edges: graph.edges
    };
}

/**
 * Given a graph, return the smallest unused integer vertex label. Resulting
 * value will be between 0 and |V|.
 * @param graph Graph whose vertex labels will be checked
 * @returns Smallest unused number in the vertex labels
 */
export function getSmallestLabel(graph: Graph): number {
    // Get all numeric vertex labels by filtering out non-integer vertex labels
    // and retrieving the remaining vertex labels as numbers
    const labels = graph.vertices.filter(v => isInteger(v.label))
                                 .map(v => Number(v.label));

    // Keep track of which numbers have been seen in a boolean array. Note that
    // the smallest number is guaranteed to be in the range [0..n-1].
    const n = labels.length;
    const boolArr: boolean[] = new Array(n).fill(false);

    for (const name of labels) {
        if (name < n) {
            boolArr[name] = true;
        }
    }

    // Return the first false index, which represents the lowest value in the
    // range [1..n] that is not in the `names` array
    for (let i = 0; i < n; i++) {
        if (!boolArr[i]) {
            return i;
        }
    }

    // If no index is true, then every value in the range [0..n-1] must be in the
    // `names` array, and thus n is the smallest possible label
    return n;
}