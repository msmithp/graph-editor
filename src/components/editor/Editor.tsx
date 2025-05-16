import type { Graph } from "../../types/Graph";
import { VertexGraphic, EdgeGraphic } from ".";


const vs = [];
for (let i = 0; i < 10; i++) {
    vs.push({
        label: `${i}`,
        xpos: Math.random() * 800,
        ypos: Math.random() * 800
    })
}
const edges = [
    {source: vs[0], destination: vs[1], weight: ""},
    {source: vs[1], destination: vs[2], weight: ""}
];

const test: Graph = {
    vertices: vs,
    edges: edges
};

function Editor() {
    const vertices = test.vertices.map((v, i) =>
        <VertexGraphic key={i} vertex={v}/>
    );

    const edges = test.edges.map((e, i) =>
        <EdgeGraphic key={i} edge={e}/>
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