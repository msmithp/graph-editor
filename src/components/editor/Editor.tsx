import { useState } from "react";
import type { Graph } from "../../types/Graph";
import type { Mode } from "../../types/Menu";
import { deleteVertexFromIndex } from "./editorUtils";
import { VertexGraphic, EdgeGraphic, Toolbar } from ".";
import { roundToBase, squeeze } from "../../static/utils";


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
    const [mode, setMode] = useState<Mode>("move");

    // console.log("Updating editor...");
    // console.log(graph);

    function updateMode(mode: Mode) {
        setMode(mode);
    }

    const vertices = graph.vertices.map((v, i) => {
        function updateLocation(x: number, y: number, gridBase?: number): void {
            console.log("Updating location of vertex " + i);
            let newVertices = graph.vertices;
            if (gridBase != undefined) {
                newVertices[i].xpos = roundToBase(squeeze(x, 0, WIDTH), gridBase);
                newVertices[i].ypos = roundToBase(squeeze(y, 0, HEIGHT), gridBase);
            } else {
                newVertices[i].xpos = squeeze(x, 0, WIDTH), gridBase;
                newVertices[i].ypos = squeeze(y, 0, HEIGHT), gridBase;
            }
            setGraph({
                vertices: newVertices,
                edges: graph.edges
            });
        }

        function deleteVertex(): void {
            console.log("Removing vertex " + i);
            setGraph(deleteVertexFromIndex(graph, i));
        }

        function updateLabel(label: string): void {
            let newVertices = graph.vertices;
            newVertices[i].label = label;
            setGraph({
                vertices: newVertices,
                edges: graph.edges
            })
        }

        return (
            <VertexGraphic
                key={i}
                vertex={v}
                mode={mode}
                updateLocation={updateLocation}
                updateLabel={updateLabel}
                onDelete={deleteVertex}
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
                <svg width={WIDTH} height={HEIGHT} style={{borderColor: "black", borderStyle: "solid", borderRadius: "0.7rem"}}>
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