import type { Graph, Vertex } from "../../types/Graph.ts";
import type { Mode } from "../../types/Menu.ts";


// export function getOnClickVertex(mode: Mode) {

// }

// export function getOnDragVertex(mode: Mode) {

// }

// export function getOnClickEdge(mode: Mode) {

// }

// export function getOnClickWhitespace(mode: Mode) {

// }

export function deleteVertex(G: Graph, v: Vertex): Graph {
    // Get index of vertex to be removed
    const idx = G.vertices.indexOf(v);

    if (idx === -1) {
        // Vertex doesn't exist in graph, so don't remove anything
        return G;
    } else {
        // Delete vertex at specified index
        return deleteVertexFromIndex(G, idx);
    }
}

export function deleteVertexFromIndex(G: Graph, idx: number): Graph {
    // Get vertex to be removed
    const removedVertex = G.vertices[idx];

    // Remove vertex from list of vertices
    const newVertices = G.vertices;
    newVertices.splice(idx, 1);

    // Remove all edges incident with the removed vertex
    const newEdges = G.edges.filter(e => e.source !== removedVertex 
                                      && e.destination !== removedVertex);

    // Return new graph
    return {
        vertices: newVertices,
        edges: newEdges
    }
}