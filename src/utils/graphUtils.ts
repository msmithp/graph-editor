import { isInteger, roundToBase, squeeze } from "./utils.ts";
import type { Graph, Vertex, Edge } from "../types/Graph.ts";
import TupleMap from "../classes/TupleMap.ts";


/**
 * Given a graph, return a new graph with a new vertex added
 * @param graph Graph to be used as a base
 * @param x `x`-coordinate of new vertex
 * @param y `y`-coordinate of new vertex
 * @param label Label of new vertex
 * @param color Color of new vertex
 * @param gridBase Grid base, if any, to round coordinates to
 * @returns New graph with vertex added
 */
export function createVertex(graph: Graph, x: number, y: number,
    label?: string, color?: string, gridBase?: number): Graph {
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
        color: color === undefined ? "#FFFFFF" : color
    };

    // Return new graph with vertex added
    return {
        vertices: [...graph.vertices, newVertex],
        edges: [...graph.edges, new Map()]
    };
}

/**
 * Given a graph, return a new graph with a new edge added
 * @param graph Graph to be used as a base
 * @param source Index of source vertex
 * @param destination Index of destination vertex
 * @param weight Weight of edge
 * @param color Color of edge
 * @returns New graph with edge added
 */
export function createEdge(graph: Graph, source: number, destination: number,
    weight?: string, color?: string): Graph {
    if (source === destination) {
        // Prevent loops... for now
        return graph;
    }

    const newEdge: Edge = {
        weight: weight === undefined ? "" : weight,
        color: color === undefined ? "#000000" : color
    };

    // Get list of all edges from `source` to `destination`
    const edgeList = graph.edges[source].get(destination);

    const newEdges = structuredClone(graph.edges);
    if (edgeList === undefined) {
        // No edges currently exist from `source` to `destination`, so make a
        // new list
        newEdges[source].set(destination, [newEdge]);
    } else {
        // Some edges already exist from `source` to `destination`, so add the
        // new edge to them
        newEdges[source].set(destination, [...edgeList, newEdge])
    }

    return {
        vertices: graph.vertices,
        edges: newEdges
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
    // Remove vertex from list of vertices
    const newVertices = structuredClone(graph.vertices);
    newVertices.splice(idx, 1);

    const newEdges: Map<number, Edge[]>[] = [];
    for (let [i, edgeMap] of graph.edges.entries()) {
        if (i === idx) {
            // Skip index of deleted vertex
            continue;
        } else if (i > idx) {
            // Decrement the index of this vertex to account for deletion of
            // the vertex at the index `idx`
            i -= 1;
        }

        for (let [j, edges] of edgeMap.entries()) {
            if (j === idx) {
                // Skip index of deleted vertex
                continue;
            } else if (j > idx) {
                // Decrement the index of this vertex to account for the
                // deletion of the vertex at the index `idx`
                j -= 1;
            }

            newEdges[i].set(j, edges);
        }
    }

    // Return new graph
    return {
        vertices: newVertices,
        edges: newEdges
    };
}

/**
 * Given a graph, return a new graph with the edge at a given index removed
 * @param graph Graph to be used as a base
 * @param source Index of source vertex of edge
 * @param destination Index of destination vertex of edge
 * @param index Index of edge in the edge list of the source-destination
 *              edge map
 * @returns New graph with the edge at `idx` removed
 */
export function deleteEdge(graph: Graph, source: number, destination: number,
    index: number): Graph {
    const newEdges = structuredClone(graph.edges);

    const edgeList = newEdges[source].get(destination);

    if (edgeList !== undefined) {
        newEdges[source].set(
            destination, edgeList.filter((_, i) => i !== index)
        );
    }

    return {
        vertices: graph.vertices,
        edges: newEdges
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
export function changeVertexLabel(graph: Graph, idx: number,
    label: string): Graph {
    const newVertices = structuredClone(graph.vertices);
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
export function changeVertexColor(graph: Graph, idx: number,
    color: string): Graph {
    const newVertices = structuredClone(graph.vertices);
    newVertices[idx].color = color;

    return {
        vertices: newVertices,
        edges: graph.edges
    };
}

/**
 * Given a graph, return a new graph with the color and label of a vertex at a
 * given index updated
 * @param graph Graph to be used as a base
 * @param idx Index of vertex whose color will be updated
 * @param label New label of vertex
 * @param color New color of vertex, as a hex code in the format `"#FFFFFF"`
 * @returns New graph with updated vertex color
 */
export function changeVertexLabelAndColor(graph: Graph, idx: number,
    label: string, color: string): Graph {
    const newVertices = structuredClone(graph.vertices);
    newVertices[idx].label = label;
    newVertices[idx].color = color;

    return {
        vertices: newVertices,
        edges: graph.edges
    };
}

/**
 * Given a graph, return a new graph with the weight of a given edge updated
 * @param graph Graph to be used as a base
 * @param source Index of source vertex of edge
 * @param destination Index of destination vertex of edge
 * @param index Index of edge whose weight will be updated in the edge list of
 *              the source-destination edge map
 * @param weight New weight of edge
 * @returns New graph with updated edge weight
 */
export function changeEdgeWeight(graph: Graph, source: number,
    destination: number,index: number, weight: string): Graph {
    const newEdges = structuredClone(graph.edges);
    
    const edgeList = newEdges[source].get(destination);

    if (edgeList === undefined) {
        return graph;
    } else {
        // Modify weight (will reflect in map too)
        edgeList[index].weight = weight;

        return {
            vertices: graph.vertices,
            edges: newEdges
        };
    }
}

/**
 * Given a graph, return a new graph with the color of a given edge updated
 * @param graph Graph to be used as a base
 * @param source Index of source vertex of edge
 * @param destination Index of destination vertex of edge
 * @param index Index of edge whose color will be updated in the edge list of
 *              the source-destination edge map
 * @param color New color of edge, as a hex code in the format `"#FFFFFF"`
 * @returns New graph with updated edge color
 */
export function changeEdgeColor(graph: Graph, source: number,
    destination: number,index: number, color: string): Graph {
    const newEdges = structuredClone(graph.edges);
    
    const edgeList = newEdges[source].get(destination);

    if (edgeList === undefined) {
        return graph;
    } else {
        // Modify color (will reflect in map too)
        edgeList[index].color = color;

        return {
            vertices: graph.vertices,
            edges: newEdges
        };
    }
}

/**
 * Given a graph, return a new graph with the weight and color of a given edge
 * updated
 * @param graph Graph to be used as a base
 * @param source Index of source vertex of edge
 * @param destination Index of destination vertex of edge
 * @param index Index of edge whose color will be updated in the edge list of
 *              the source-destination edge map
 * @param color New color of edge, as a hex code in the format `"#FFFFFF"`
 * @param weight New weight of edge
 * @returns New graph with updated edge color
 */
export function changeEdgeWeightAndColor(graph: Graph, source: number,
    destination: number, index: number, weight: string, color: string): Graph {
    const newEdges = structuredClone(graph.edges);
    
    const edgeList = newEdges[source].get(destination);

    if (edgeList === undefined) {
        return graph;
    } else {
        // Modify weight and color (will reflect in map too)
        edgeList[index].weight = weight;
        edgeList[index].color = color;

        return {
            vertices: graph.vertices,
            edges: newEdges
        };
    }
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
export function changeVertexLocation(graph: Graph, idx: number, x: number,
    y: number, width?: number, height?: number, gridBase?: number): Graph {
    const newVertices = structuredClone(graph.vertices);
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

    // If no index is true, then every value in the range [0..n-1] must be in
    // the `names` array, and thus n is the smallest possible label
    return n;
}

/**
 * Given a graph, return a new graph with the locations of each vertex rounded
 * to a multiple of a given base
 * @param graph Graph to be used as a base
 * @param base Integer base, which each vertex's `x`- and `y`-coordinates will
 *             be a multiple of
 * @returns New graph with rounded vertex locations
 */
export function snapVerticesToGrid(graph: Graph, base: number): Graph {
    // Create deep copy of graph
    const newGraph = structuredClone(graph);

    // Mutate new graph by rounding the coordinates of each vertex to base
    for (const v of newGraph.vertices) {
        v.xpos = roundToBase(v.xpos, base);
        v.ypos = roundToBase(v.ypos, base);
    }

    return newGraph;
}

type EdgeIterator = TupleMap<
    number, // Tuples of the form [number, number]
    {
        source: number,
        destination: number,
        edge: Edge,
        index: number
    }[]
>;

/**
 * Return a map of edges that groups edges between two vertices together into
 * one edge list regardless of the direction of the edges.
 * 
 * For example, given two vertices `v1` and `v2` with edges `a` (`v1 -> v2`)
 * and `b` (`v2 -> v1`), `a` and `b` will be in the same list in the map,
 * both corresponding to the key `(v1, v2)` (assuming the index of `v1` is less
 * than that of `v2`).
 * 
 * In order to preserve directional information, the
 * indices of the source and destination vertices are stored with each list
 * item. To enable interactivity, the index of each edge in the original graph
 * is also stored.
 * @param graph Graph whose edges will be formatted into an iterator
 * @returns Map of edges in the format `[(v1, v2), edges]` for all vertices 
 *          `v1` and `v2` such that `v1` and `v2` have at least one edge
 *          between them
 */
export function getEdgeIterator(graph: Graph): EdgeIterator {
    // We provide the Number() function for converting from strings to numbers
    const iterator: EdgeIterator = new TupleMap(Number);

    for (const [i, edgeMap] of graph.edges.entries()) {
        for (const [j, edges] of edgeMap.entries()) {
            // For the edge ij, the first vertex (v1) will always be the one
            // with the lower index, while the second vertex (v2) will always
            // be the one with the higher index
            const [v1, v2] = i <= j ? [i, j] : [j, i];

            // Create a list of ij edges which will be inserted in the map with
            // the key [v1, v2]
            const edgesToInsert = edges.map((e, idx) => ({
                source: i,
                destination: j,
                edge: e,
                index: idx
            }));

            // Get all edges in the map between the vertices i and j
            const ijEdges = iterator.get([v1, v2]);

            if (ijEdges !== undefined) {
                // Insert new edges alongside pre-existing ij edges
                iterator.set([v1, v2], [...ijEdges, ...edgesToInsert]);
            } else {
                // Create new list of ij edges
                iterator.set([v1, v2], edgesToInsert);
            }
        }
    }

    return iterator;
}