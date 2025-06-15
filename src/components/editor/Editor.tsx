import React, { useState } from "react";
import type { Graph, Vertex } from "../../types/Graph";
import type { Mode } from "../../types/Menu";
import { 
    deleteVertexFromIndex, changeVertexLocation, createVertex,
    getSmallestLabel, deleteEdgeFromIndex, createEdge, changeVertexLabel,
    changeVertexColor, changeEdgeColor, changeEdgeWeight,
    snapVerticesToGrid
} from "../../utils/editorUtils";
import {
    VertexGraphic, EdgeGraphic, Toolbar, EditVertexMenu, EditEdgeMenu,
    Grid
} from ".";
import { getSVGPoint } from "../../utils/utils";
import "../../style/Editor.css";
import { SettingsMenu } from "./menus";


// Placeholder data
const vs = [];
for (let i = 0; i < 10; i++) {
    vs.push({
        label: `${i}`,
        xpos: Math.random() * 800,
        ypos: Math.random() * 800,
        color: "#FFFFFF"
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
    const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<number | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>("#000000");
    const [gridBase, setGridBase] = useState<number | null>(null);
    const [isGridShown, setIsGridShown] = useState<boolean>(false);
    const [isDirected, setIsDirected] = useState<boolean>(false);
    

    function updateMode(mode: Mode) {
        // When changing modes, set any active drawing/edit to null
        setFromVertex(null);

        // Update mode
        setMode(mode);
    }

    /**
     * Set the vertex at a given index as selected, enabling editing
     * @param index Index of vertex in the list of vertices to be selected
     */
    function selectVertex(index: number): void {
        // Update selections
        setSelectedVertex(index);
        setSelectedEdge(null);
    }

    /**
     * Set the edge at a given index as selected, enabling editing
     * @param index Index of edge in the list of edges to be selected
     */
    function selectEdge(index: number): void {
        setSelectedEdge(index);
        setSelectedVertex(null);
    }

    /**
     * Erase the vertex at a given index
     * @param index Index of the vertex in the list of vertices to be deleted
     */
    function eraseVertex(index: number): void {
        const currentVertex = graph.vertices[index];

        if (selectedVertex != null) {
            if (index === selectedVertex) {
                // If vertex being erased is currently selected, deselect it
                // before erasing it
                setSelectedVertex(null);
            } else if (index < selectedVertex) {
                // If vertex being erased has a lower index than the currently
                // selected vertex, decrement the index of the currently
                // selected vertex by 1
                setSelectedVertex(selectedVertex - 1);
            }
        }

        // If vertex being erased is an endpoint of currently
        // selected edge, deselect the edge before erasing
        if (selectedEdge !== null) {
            const currentEdge = graph.edges[selectedEdge];
            if (currentEdge.source === currentVertex
                || currentEdge.destination === currentVertex) {
                setSelectedEdge(null);
            }
        }

        setGraph(deleteVertexFromIndex(graph, index));
    }

    /**
     * Erase the edge at a given index
     * @param index Index of the edge in the list of edges to be deleted
     */
    function eraseEdge(index: number): void {
        if (selectedEdge !== null) {
            // If edge being erased is currently selected, deselect it before
            // erasing it
            if (index === selectedEdge) {
                setSelectedEdge(null);
            } else if (index < selectedEdge) {
                // If edge being erased has a lower index than the currently
                // selected edge, decrement the index of the currently selected
                // edge by 1
                setSelectedEdge(selectedEdge - 1);
            }
        }

        setGraph(deleteEdgeFromIndex(graph, index));
    }

    /**
     * Draw a new vertex at the clicked point of an SVG element
     * @param e Pointer event from clicking an SVG element
     */
    function onClickSvg(e: React.PointerEvent<SVGSVGElement>): void {
        // Convert SVG coordinates to client coordinates
        const pt = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
        
        // Create a new vertex. Default name of new vertex is the lowest 
        // non-negative integer not already used as a vertex label.
        const label = String(getSmallestLabel(graph));
        const color = "#FFFFFF";
        if (gridBase !== null) {
            setGraph(createVertex(graph, pt.x, pt.y, label, color, gridBase));
        } else {
            setGraph(createVertex(graph, pt.x, pt.y, label, color));
        }

        // Set selected vertex to newly created vertex
        selectVertex(graph.vertices.length);
    }

    /**
     * Update the current position of the mouse within an SVG element
     * @param e Mouse event from moving the mouse in an SVG element
     */
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
            if (gridBase !== null) {
                setGraph(changeVertexLocation(graph, i, x, y, 
                    WIDTH, HEIGHT, gridBase));
            } else {
                setGraph(changeVertexLocation(graph, i, x, y, WIDTH, HEIGHT));
            }
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
                    return () => selectVertex(i);
                case "DRAW_EDGES":
                    if (fromVertex === null) {
                        // Start drawing a new edge from this vertex
                        return () => setFromVertex(v);
                    } else {
                        // Create the new edge
                        return () => {
                            setGraph(createEdge(graph, fromVertex, v));
                            setFromVertex(null);
                            selectEdge(graph.edges.length);
                        };
                    }
                case "ERASE":
                    // Delete this vertex
                    return () => eraseVertex(i);
                case "PAINT":
                    // Set the color of this vertex to the selected color
                    return () => setGraph(
                        changeVertexColor(graph, i, selectedColor)
                    );
                case "EYEDROP":
                    // Set selected color to color of this vertex
                    return () => setSelectedColor(v.color);
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
                    return () => selectEdge(i);
                case "ERASE":
                    // Delete this edge
                    return () => eraseEdge(i);
                case "PAINT":
                    // Set the color of this edge to the selected color
                    return () => setGraph(
                        changeEdgeColor(graph, i, selectedColor)
                    );
                case "EYEDROP":
                    // Set selected color to color of this edge
                    return () => setSelectedColor(e.color);
                default:
                    // Do nothing otherwise
                    return () => { return };
            }
        }

        return (
            <EdgeGraphic
                key={i}
                edge={e}
                isDirected={isDirected}
                onClick={getOnClickEdge(mode)}
            />
        );
    });

    // Set up info and editor for selected vertex/edge, if any
    let selectedElementEditor;
    if (selectedVertex !== null) {
        selectedElementEditor = <EditVertexMenu
            vertex={graph.vertices[selectedVertex]}
            onChangeColor={color => setGraph(
                changeVertexColor(graph, selectedVertex, color)
            )}
            onChangeLabel={label => setGraph(
                changeVertexLabel(graph, selectedVertex, label)
            )}
        />;
    } else if (selectedEdge !== null) {
        selectedElementEditor = <EditEdgeMenu
            edge={graph.edges[selectedEdge]} 
            onChangeColor={color => setGraph(
                changeEdgeColor(graph, selectedEdge, color)
            )}
            onChangeWeight={weight => setGraph(
                changeEdgeWeight(graph, selectedEdge, weight)
            )}
        />;
    } else {
        selectedElementEditor = <p>No element selected</p>;
    }

    return (
        <div className="editor">
            {/* Toolbar */}
            <div className="editorToolbar">
                <Toolbar
                    vertexColor={selectedColor}
                    onChangeMode={updateMode}
                    onChangeColor={color => setSelectedColor(color)}
                />
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
                        {/* Display grid in background */}
                        { gridBase && isGridShown &&
                            <Grid
                                width={WIDTH}
                                height={HEIGHT}
                                base={gridBase}
                            />
                        }

                        {/* Display a prospective edge at the location of the
                            cursor if a fromVertex has been selected */}
                        { fromVertex &&
                            <path 
                                className="edgePath"
                                d={`M ${fromVertex.xpos} ${fromVertex.ypos} 
                                    L ${mousePos.x} ${mousePos.y}`}
                                stroke="#000000"
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

                                // Hide vertex/edge edit menus. We disable this
                                // function when the mode is DRAW_VERTICES so
                                // that when the grid is on, we don't
                                // instantly deselect newly created vertices
                                if (mode !== "DRAW_VERTICES") {
                                    setSelectedVertex(null);
                                    setSelectedEdge(null);
                                }
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

            {/* Accordion menu sidebar */}
            <div className="accordion" style={{textAlign: "left"}}>
                <details>
                    <summary>Settings</summary>
                    <SettingsMenu
                        onUpdateDirected={isDirected => 
                            setIsDirected(isDirected)}
                        onUpdateGridBase={base => {
                            setGridBase(base);
                            if (base !== null) {
                                setGraph(snapVerticesToGrid(graph, base));
                            }
                        }}
                        onShowGrid={isShown => setIsGridShown(isShown)}
                    />
                </details>
                <details>
                    <summary>Graph Information</summary>
                </details>
                <details>
                    <summary>Operations</summary>
                </details>
                <details>
                    <summary>Generators</summary>
                </details>
                <details>
                    <summary>Import/Export</summary>
                </details>
            </div>
        </div>
    );
}

export default Editor;