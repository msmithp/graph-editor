import React, { useState } from "react";
import type { Edge, Graph, Vertex } from "../../types/Graph";
import type { Mode } from "../../types/Menu";
import { 
    deleteVertexFromIndex, changeVertexLocation, createVertex,
    getSmallestLabel, deleteEdgeFromIndex, createEdge, changeVertexLabel,
    changeVertexColor, changeEdgeColor, changeEdgeWeight
} from "../../utils/editorUtils";
import {
    VertexGraphic, EdgeGraphic, Toolbar, EditVertexMenu, 
    EditEdgeMenu
} from ".";
import { getSVGPoint } from "../../utils/utils";
import "../../style/Editor.css";


// Placeholder data
const vs = [];
for (let i = 0; i < 10; i++) {
    vs.push({
        label: `${i}`,
        xpos: Math.random() * 800,
        ypos: Math.random() * 800,
        color: "#AAAAAA"
    });
}
const edges = [
    {source: vs[0], destination: vs[1], weight: "", color: "#00FFAA"},
    {source: vs[1], destination: vs[2], weight: "", color: "#FF11AA"}
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
    const [mousePos, setMousePos] = 
        useState<{x: number, y: number}>({ x: 0, y: 0 });
    const [fromVertex, setFromVertex] = useState<Vertex | null>(null);
    const [selectedVertex, setSelectedVertex] = 
        useState<{ vertex: Vertex, index: number } | null>(null);
    const [selectedEdge, setSelectedEdge] = 
        useState<{ edge: Edge, index: number } | null>(null);
    const [currentColor, setCurrentColor] = useState<string>("#FFFFFF");

    function updateMode(mode: Mode) {
        // When changing modes, set any active drawing/edit to null
        setFromVertex(null);

        // Update mode
        setMode(mode);
    }

    function selectVertex(vertex: Vertex, index: number) {
        setSelectedVertex({
            vertex: vertex,
            index: index
        });
        setSelectedEdge(null);
    }

    function selectEdge(edge: Edge, index: number) {
        setSelectedEdge({
            edge: edge,
            index: index
        });
        setSelectedVertex(null);
    }

    function onClickSvg(e: React.PointerEvent<SVGSVGElement>): void {
        // Convert SVG coordinates to client coordinates
        const pt = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
        
        // Create a new vertex. Default name of new vertex is the lowest 
        // non-negative integer not already used as a vertex label.
        const label = String(getSmallestLabel(graph));
        const color = "#FFFFFF";
        setGraph(
            createVertex(graph, pt.x, pt.y, label, color)
        );

        // Set selected vertex to newly created vertex
        const newVertex: Vertex = {
            label: label,
            xpos: pt.x,
            ypos: pt.y,
            color: color
        };

        selectVertex(newVertex, graph.vertices.length + 1);
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
         * Function that will be called when this vertex is clicked. Changes
         * based on the current editor mode.
         * @param mode Current editor mode
         * @returns An `onClick()` function that will be called when this
         *          vertex is clicked
         */
        function getOnClickVertex(mode: Mode): () => void {
            switch(mode) {
                case "MOVE":
                    return () => selectVertex(v, i);
                case "DRAW_EDGES":
                    if (fromVertex === null) {
                        // Start drawing a new edge from this vertex
                        return () => setFromVertex(v);
                    } else {
                        // Create the new edge
                        return () => {
                            setGraph(createEdge(graph, fromVertex, v));
                            setFromVertex(null);
                        };
                    }
                case "ERASE":
                    // Delete this vertex
                    return () => setGraph(deleteVertexFromIndex(graph, i));
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
                case "MOVE":
                    return () => selectEdge(e, i);
                case "ERASE":
                    // Delete this edge
                    return () => setGraph(deleteEdgeFromIndex(graph, i));
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

    let selectedElementEditor;
    if (selectedVertex !== null) {
        selectedElementEditor = <EditVertexMenu
            vertex={selectedVertex.vertex}
            onChangeColor={color => setGraph(
                changeVertexColor(graph, selectedVertex.index, color)
            )}
            onChangeLabel={label => setGraph(
                changeVertexLabel(graph, selectedVertex.index, label)
            )}
        />;
    } else if (selectedEdge !== null) {
        selectedElementEditor = <EditEdgeMenu
            edge={selectedEdge.edge} 
            onChangeColor={color => setGraph(
                changeEdgeColor(graph, selectedEdge.index, color)
            )}
            onChangeWeight={weight => setGraph(
                changeEdgeWeight(graph, selectedEdge.index, weight)
            )}
        />;
    } else {
        selectedElementEditor = <p>No element selected</p>;
    }

    return (
        <div className="editor">
            {/* Toolbar */}
            <div className="editorToolbar">
                <Toolbar onChange={updateMode} />
            </div>

            {/* Main editor window */}
            <div className="editorWindow">
                <div className="editorWindowInfo">
                    {/* Edit selected vertex/edge */}
                    {selectedElementEditor}
                </div>
                <div className="editorWindowGraph">
                    <svg
                        width={WIDTH} 
                        height={HEIGHT}
                        style={{borderColor: "black", 
                                borderStyle: "solid",
                                borderRadius: "0.7rem"}}
                        onPointerDown={mode === "DRAW_VERTICES" ?
                            onClickSvg : undefined}
                        onMouseMove={mode === "DRAW_EDGES" ?
                            onMouseMoveSvg : undefined}
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
                            />
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
                            onClick={() => {
                                // Cancel edge being drawn
                                setFromVertex(null);

                                // Hide vertex/edge edit menus
                                setSelectedVertex(null);
                                setSelectedEdge(null);
                            }}
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
        </div>
    );
}

export default Editor;