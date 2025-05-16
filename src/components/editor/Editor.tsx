import { useState } from "react";
import type { Graph } from "../../types/Graph";
import type { Mode } from "../../types/Menu";
import { getOnClickVertex, getOnClickEdge, 
    getOnClickWhitespace, getOnDragVertex } from "./editorUtils";
import { VertexGraphic, EdgeGraphic, Toolbar } from ".";


// Placeholder data
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

const graph: Graph = {
    vertices: vs,
    edges: edges
};

function Editor() {
    // const [graph, setGraph] = useState<Graph>({
    //     vertices: [],
    //     edges: []
    // });
    const [mode, setMode] = useState<Mode>("select");

    function updateMode(mode: Mode) {
        setMode(mode);
    }

    const onClickVertex = getOnClickVertex(mode);
    const onDragVertex = getOnDragVertex(mode);
    const onClickEdge = getOnClickEdge(mode);
    const onClickWhitespace = getOnClickWhitespace(mode);

    const vertices = graph.vertices.map((v, i) =>
        <VertexGraphic key={i} vertex={v}/>
    );

    const edges = graph.edges.map((e, i) =>
        <EdgeGraphic key={i} edge={e}/>
    );

    return (
        <div className="editor">
            <div className="editorToolbar">
                <Toolbar onChange={updateMode} />
            </div>
            <div className="editorWindow">
                <svg width="1000" height="1000">
                    <g className="edges">
                        {edges}
                    </g>
                    <g className="vertices">
                        {vertices}
                    </g>
                </svg>
            </div>
        </div>
    )
}

export default Editor;