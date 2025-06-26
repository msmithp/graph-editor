/**
 * A graph consists of two parts:
 * * A list of vertices
 * * A list of edge maps, which are structured as follows:
 *     * There are |V| different maps in `edges`
 *     * The map at index i contains an entry for each vertex with which the
 *       vertex i is adjacent
 *     * Each entry in `edges` is a list, in order to support multigraphs
 */
export interface Graph {
    vertices: Vertex[],
    edges: Map<number, Edge[]>[]
}

export interface Vertex {
    label: string,
    xpos: number,
    ypos: number,
    color: string
}

export interface Edge {
    weight: string,
    color: string
}
