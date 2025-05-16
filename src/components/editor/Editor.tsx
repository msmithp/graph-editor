import { Graph } from "../../types/Graph";
import { Vertex, Edge } from ".";


const test: Graph = new Graph();
for (let i = 0; i < 10; i++) {
    test.addVertex(`${i}`, Math.random()*800, Math.random()*800);
}
test.addEdge(test.vertices[0], test.vertices[1]);
test.addEdge(test.vertices[1], test.vertices[2]);

function Editor() {
    const vertices = test.vertices.map((v, i) =>
        <Vertex key={i} name={v.name} xpos={v.xpos} ypos={v.ypos}/>
    );

    const edges = test.vertices.map((v, i) =>
        v.neighbors.map((u, j) => 
            <Edge key={`${i} ${j}`} source={v} destination={u.vertex}/>
        )
    );

    return (
        <>
            <svg width="1000" height="1000">
                <g>
                    {edges}
                </g>
                <g>
                    {vertices}
                </g>
            </svg>
        </>
    )
}

export default Editor;