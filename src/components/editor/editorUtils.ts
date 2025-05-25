import React from "react";
import { roundToBase, squeeze } from "../../static/utils.ts";
import type { Graph, Vertex } from "../../types/Graph.ts";
import type { Mode } from "../../types/Menu.ts";


export function getOnClickVertex(mode: Mode): (v: Vertex) => void {
    switch(mode) {
        case "DRAW_EDGES":
            return (v: Vertex) => drawEdge(v);
        case "ERASE":

        case "EDIT":

        default:
            // Do nothing otherwise
            return (_: Vertex) => { return }
    }
}

export function createVertex(graph: Graph, x: number, y: number,
    label?: string): Graph {
    // Create new vertex
    const newVertex: Vertex = {
        xpos: x,
        ypos: y,
        label: label === undefined ? "" : label
    };

    // Return new graph with vertex added
    return {
        vertices: [...graph.vertices, newVertex],
        edges: graph.edges
    };
}

function drawEdge(v: Vertex) {

}

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

export function changeVertexLabel(graph: Graph, idx: number, label: string): Graph {
    const newVertices = graph.vertices;
    newVertices[idx].label = label;
    return {
        vertices: newVertices,
        edges: graph.edges
    };
}

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
