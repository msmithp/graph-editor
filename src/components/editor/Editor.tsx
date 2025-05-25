import React, { useState } from "react";
import type { Graph, Vertex } from "../../types/Graph";
import type { Mode } from "../../types/Menu";
import { 
    deleteVertexFromIndex,
    changeVertexLocation,
    changeVertexLabel,
    createVertex
} from "./editorUtils";
import { VertexGraphic, EdgeGraphic, Toolbar } from ".";
import { getSVGPoint } from "../../static/utils";


// Placeholder data
const vs = [];
for (let i = 0; i < 10; i++) {
    vs.push({
        label: `${i}`,
        xpos: Math.random() * 800,
        ypos: Math.random() * 800
    });
}
const edges = [
    {source: vs[0], destination: vs[1], weight: ""},
    {source: vs[1], destination: vs[2], weight: ""}
];
const placeholderGraph: Graph = {
    vertices: vs,
    edges: edges
};
// End placeholder data


const WIDTH = 800;
const HEIGHT = 800;


function Editor() {
    const [graph, setGraph] = useState<Graph>(
        // {
        //     vertices: [],
        //     edges: []
        // }
        placeholderGraph
    );
    const [mode, setMode] = useState<Mode>("MOVE");
    const [fromVertex, setFromVertex] = useState<Vertex | null>(null);

    function updateMode(mode: Mode) {
        setMode(mode);
    }

    function onClickSvg(e: React.PointerEvent<SVGSVGElement>): void {
        console.log("Drawing new vertex");
        const pt = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
        
        setGraph(createVertex(graph, pt.x, pt.y, String(graph.vertices.length)));
    }

    const vertices = graph.vertices.map((v, i) => {
        function updateLocation(x: number, y: number): void {
            setGraph(changeVertexLocation(graph, i, x, y, WIDTH, HEIGHT));
        }

        function deleteVertex(): void {
            setGraph(deleteVertexFromIndex(graph, i));
        }

        function updateLabel(label: string): void {
            setGraph(changeVertexLabel(graph, i, label));
        }

        function getOnClickVertex(mode: Mode): () => void {
            switch(mode) {
                case "DRAW_EDGES":
                    // return (v: Vertex) => drawEdge(v);
                case "ERASE":
                    return deleteVertex;
                case "EDIT":

                default:
                    // Do nothing otherwise
                    return () => { return }
            }
        }

        return (
            <VertexGraphic
                key={i}
                vertex={v}
                mode={mode}
                updateLocation={updateLocation}
                updateLabel={updateLabel}
                onClick={getOnClickVertex(mode)}
            />
        )
    });

    const edges = graph.edges.map((e, i) =>
        <EdgeGraphic
            key={i}
            edge={e}
        />
    );

    return (
        <div className="editor">
            <div className="editorToolbar">
                <Toolbar onChange={updateMode} />
            </div>
            <div className="editorWindow">
                <svg width={WIDTH} 
                    height={HEIGHT}
                    style={{borderColor: "black", borderStyle: "solid", borderRadius: "0.7rem"}}
                    onPointerDown={mode === "DRAW_VERTICES" ? onClickSvg : undefined}
                >
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