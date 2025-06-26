import type { Graph } from "../types/Graph";

export function lineGraph(graph: Graph): Graph {
    // Convert edges into vertices
    const newVertices = graph.edges.map(e => {
        const midpoint = getEdgeMidpoint(e);
        return {
            label: `${e.source.label}${e.destination.label}`,
            xpos: midpoint.x,
            ypos: midpoint.y,
            color: "#FFFFFF"
        };
    })

    // Iterate through edges and find all edges with a vertex in common
    const newEdges = [];
    for (let i = 0; i < graph.edges.length; i++) {
        const e1 = graph.edges[i];

        for (let j = i; j < graph.edges.length; j++) {
            const e2 = graph.edges[j];

            if (e1 === e2) {
                continue
            };

            if (
                e1.source === e2.source
                || e1.source === e2.destination
                || e1.destination === e2.source
                || e1.destination === e2.destination
            ) {
                // If e1 and e2 have a vertex in common, create an edge between
                // the vertices that correspond to e1 and e2
                newEdges.push({
                    source: newVertices[i],
                    destination: newVertices[j],
                    weight: "",
                    color: "#000000"
                });
            }
        }
    }

    return {
        vertices: newVertices,
        edges: newEdges
    };
}

export function complement(graph: Graph): Graph {
    return graph;
}

export function completeGraph(n: number, width: number, 
    height: number): Graph {
    
}

export function cycle(n: number, width: number,
    height: number): Graph {

}