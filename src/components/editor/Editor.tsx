import React, { useState } from "react";
import type { Graph, Vertex } from "../../types/Graph";
import type { Mode } from "../../types/Menu";
import { 
    deleteVertexFromIndex,
    changeVertexLocation,
    changeVertexLabel,
    createVertex,
    getSmallestLabel,
    deleteEdgeFromIndex,
    createEdge
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
    const [mousePos, setMousePos] = useState<{x: Number, y: number}>(
        { x: 0, y: 0 }
    );
    const [fromVertex, setFromVertex] = useState<Vertex | null>(null);

    function updateMode(mode: Mode) {
        setFromVertex(null);
        setMode(mode);
    }

    function onClickSvg(e: React.PointerEvent<SVGSVGElement>): void {
        console.log("Clicking SVG");
        // Convert SVG coordinates to client coordinates
        const pt = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
        
        // Default name of new vertex is the lowest integer not already used
        // as a vertex label
        setGraph(
            createVertex(graph, pt.x, pt.y, String(getSmallestLabel(graph)))
        );
    }

    function onMouseMoveSvg(e: React.MouseEvent<SVGSVGElement>): void {
        const pt = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
        setMousePos({
            x: pt.x,
            y: pt.y
        });
    }

    const vertices = graph.vertices.map((v, i) => {
        /**
         * Function that will be called when this vertex's location is updated
         * @param x New `x`-coordinate of vertex
         * @param y New `y`-coordinate of vertex
         */
        function updateLocation(x: number, y: number): void {
            setGraph(changeVertexLocation(graph, i, x, y, WIDTH, HEIGHT));
        }

        /**
         * Function that will be called when this vertex's label is updated
         * @param label New label of vertex
         */
        function updateLabel(label: string): void {
            setGraph(changeVertexLabel(graph, i, label));
        }

        /**
         * Function that will be called when this vertex is clicked. Changes
         * based on the current editor mode.
         * @param mode Current editor mode
         * @returns An `onClick()` function that will be called when this
         *          vertex is clicked
         */
        function getOnClickVertex(mode: Mode): () => void {
            switch(mode) {
                case "DRAW_EDGES":
                    if (fromVertex === null) {
                        // Start drawing a new edge from this vertex
                        return () => setFromVertex(graph.vertices[i]);
                    } else {
                        // Create the new edge
                        return () => {
                            setGraph(
                                createEdge(graph, fromVertex, 
                                    graph.vertices[i])
                            );
                            setFromVertex(null);
                        };
                    }
                case "ERASE":
                    // Delete this vertex
                    return () => setGraph(deleteVertexFromIndex(graph, i));
                case "EDIT":

                default:
                    // Do nothing otherwise
                    return () => { return };
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
        );
    });

    const edges = graph.edges.map((e, i) => {
        /**
         * Function that will be called when this edge is clicked. Changes
         * based on the current editor mode.
         * @param mode Current editor mode
         * @returns An `onClick()` function that will be called when this
         *          edge is clicked
         */
        function getOnClickEdge(mode: Mode): () => void {
            switch(mode) {
                case "ERASE":
                    // Delete this edge
                    return () => setGraph(deleteEdgeFromIndex(graph, i));
                case "EDIT":

                default:
                    // Do nothing otherwise
                    return () => { return };
            }
        }

        return (
            <EdgeGraphic
                key={i}
                edge={e}
                onClick={getOnClickEdge(mode)}
            />
        );
    });

    return (
        <div className="editor">
            <div className="editorToolbar">
                <Toolbar onChange={updateMode} />
            </div>
            <div className="editorWindow">
                <svg
                    width={WIDTH} 
                    height={HEIGHT}
                    style={{borderColor: "black", borderStyle: "solid", borderRadius: "0.7rem"}}
                    onPointerDown={mode === "DRAW_VERTICES" ? onClickSvg : undefined}
                    onMouseMove={mode === "DRAW_EDGES" ? onMouseMoveSvg : undefined}
                >
                    {/* Display a prospective edge at the location of the
                        cursor if a fromVertex has been selected */}
                    { fromVertex &&
                        <path 
                            className="edgePath"
                            d={`M ${fromVertex.xpos} ${fromVertex.ypos} 
                                L ${mousePos.x} ${mousePos.y}`}
                            stroke="black"
                            strokeWidth="2.5"
                        >
                        </path>
                    }
                    {/* We create a transparent rectangle ABOVE the edge that
                        is currently being drawn so that clicking on whitespace
                        will register as clicking the rectangle rather than
                        the path element of the edge */}
                    <rect fill="transparent"
                        x="0"
                        y="0"
                        width={WIDTH}
                        height={HEIGHT}
                        onClick={() => setFromVertex(null)}
                    />

                    {/* Draw edges and vertices */}
                    <g className="edges">
                        {edges}
                    </g>
                    <g className="vertices">
                        {vertices}
                    </g>
                </svg>
            </div>
        </div>
    );
}

export default Editor;