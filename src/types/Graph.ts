export class Vertex {
    name: string;
    xpos: number;
    ypos: number;
    neighbors: {
        vertex: Vertex,
        weight: string
    }[];

    constructor(name: string, xpos: number, ypos: number) {
        this.name = name;
        this.xpos = xpos;
        this.ypos = ypos;
        this.neighbors = [];
    }

    addNeighbor(v: Vertex, weight: string = ""): void {
        this.neighbors.push({vertex: v, weight: weight});
    }
}

interface Edge {
    source: Vertex,
    destination: Vertex,
    weight: string
}

export class Graph {
    vertices: Vertex[];

    constructor() {
        this.vertices = [];
    }

    addVertex(name: string, xpos: number, ypos: number): void {
        this.vertices.push(new Vertex(name, xpos, ypos));
    }
    
    addEdge(source: Vertex, dest: Vertex): void {
        source.addNeighbor(dest);
    }

    getEdgeList(): Edge[] {
        const edges: Edge[] = []
        for (const u of this.vertices) {
            for (const v of u.neighbors) {
                edges.push({
                    source: u,
                    destination: v.vertex,
                    weight: ""
                });
            }
        }

        return edges;
    }
}