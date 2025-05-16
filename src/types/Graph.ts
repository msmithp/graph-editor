export interface Graph {
    vertices: Vertex[],
    edges: Edge[]
}

export interface Vertex {
    label: string,
    xpos: number,
    ypos: number
}

export interface Edge {
    source: Vertex,
    destination: Vertex,
    weight: string
}
