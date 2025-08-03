import React, { useState } from "react";
import type { Edge, Graph } from "../../types/Graph";
import type { Mode } from "../../types/Menu";
import { 
    deleteVertexFromIndex, changeVertexLocation, createVertex,
    getSmallestLabel, deleteEdge, createEdge, changeVertexLabel,
    changeVertexColor, changeEdgeColor, changeEdgeWeight,
    snapVerticesToGrid, getEdgeIterator
} from "../../utils/graphUtils";
import {
    VertexGraphic, EdgeGraphic, Toolbar, EditVertexMenu, EditEdgeMenu,
    Grid, MultiEdgeGraphic
} from ".";
import { getSVGPoint } from "../../utils/utils";
import "../../style/Editor.css";
import { 
    GeneratorsMenu, ImportExportMenu, InformationMenu, OperationsMenu,
    SettingsMenu
} from "./menus";
import { complement, lineGraph } from "../../utils/graphAlgorithms";


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
const edges: Map<number, Edge[]>[] = Array.from(
    { length: vs.length }, () => new Map()
);
edges[0].set(1, [{ weight: "abcde", color: "#00FFAA" }]);
edges[1].set(2, [{ weight: "10", color: "#FF11AA" }]);
edges[6].set(5, [{ weight: "1", color: "#000000" }, { weight: "2", color: "#000000" },
    { weight: "3", color: "#000000" }, { weight: "4", color: "#000000" },
    { weight: "5", color: "#000000" }, { weight: "6", color: "#000000" }]);
edges[5].set(6, [{ weight: "7", color: "#000000" }, { weight: "8", color: "#000000" },
    { weight: "9", color: "#000000" }, { weight: "10", color: "#000000" }]);
edges[5].set(2, [{ weight: "", color: "#000000" }]);
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
    const [fromVertex, setFromVertex] = useState<number | null>(null);
    const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
    const [selectedEdge, setSelectedEdge] = 
        useState<{source: number, destination: number, index: number } | null>(
            null
        );
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
     * Set a given edge as selected, enabling editing
     * @param source Index of source vertex of edge
     * @param destination Index of destination vertex of edge
     * @param index Index of edge in the edge list of the source-destination
     *              edge map
     */
    function selectEdge(source: number, destination: number,
        index: number): void {
        setSelectedEdge({
            source: source,
            destination: destination,
            index: index
        });
        setSelectedVertex(null);
    }

    /**
     * Erase the vertex at a given index
     * @param index Index of the vertex in the list of vertices to be deleted
     */
    function eraseVertex(index: number): void {
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
            if (selectedEdge.source === index
                || selectedEdge.destination === index) {
                setSelectedEdge(null);
            }
        }

        setGraph(deleteVertexFromIndex(graph, index));
    }

    /**
     * Erase a given edge
     * @param source Index of source vertex of edge
     * @param destination Index of destination vertex of edge
     * @param index Index of edge in the edge list of the source-destination
     *              edge map
     */
    function eraseEdge(source: number, destination: number,
        index: number): void {
        if (selectedEdge !== null) {
            // If edge being erased is currently selected, deselect it before
            // erasing it
            if (source === selectedEdge.source 
                && destination === selectedEdge.destination) {
                if (index === selectedEdge.index) {
                    // Edge being erased is currently selected, so deselect it
                    // before erasing it
                    setSelectedEdge(null);
                } else {
                    // Currently selected edge is in the same edge list as the
                    // edge being erased, so the index of the currently
                    // selected edge must be decremented if it is greater than
                    // that of the edge being erased
                    if (index < selectedEdge.index) {
                        setSelectedEdge({
                            ...selectedEdge,
                            index: selectedEdge.index - 1
                        });
                    }
                }
            }
        }

        // Finally, erase the edge
        setGraph(deleteEdge(graph, source, destination, index));
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
                        return () => setFromVertex(i);
                    } else {
                        // Create the new edge
                        return () => {
                            const newGraph = createEdge(graph, fromVertex, i);
                            setGraph(newGraph);
                            setFromVertex(null);

                            // Get edge list corresponding to source and
                            // destination vertices of new edge
                            const edgeList = newGraph.edges[fromVertex].get(i);

                            if (edgeList !== undefined) {
                                selectEdge(fromVertex, i, edgeList.length - 1);
                            } else {
                                // This code should never run since it should
                                // always be possible to access the new edge
                                setSelectedEdge(null);
                            }
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

    const edges = getEdgeIterator(graph).arrayMap(([v1, v2], edges) => {
        /**
         * Function that will be called when this edge is clicked. Changes
         * based on the current editor mode.
         * @param mode Current editor mode
         * @returns An `onClick()` function that will be called when this
         *          edge is clicked
         */
        function getOnClickEdge(edgeData: { source: number,
            destination: number, edge: Edge, index: number },
            mode: Mode): () => void {
            switch(mode) {
                case "MOVE":
                    return () => selectEdge(edgeData.source,
                        edgeData.destination, edgeData.index);
                case "ERASE":
                    // Delete this edge
                    return () => eraseEdge(edgeData.source,
                        edgeData.destination, edgeData.index);
                case "PAINT":
                    // Set the color of this edge to the selected color
                    return () => setGraph(
                        changeEdgeColor(graph, edgeData.source,
                            edgeData.destination, edgeData.index,
                            selectedColor)
                    );
                case "EYEDROP":
                    // Set selected color to color of this edge
                    return () => setSelectedColor(edgeData.edge.color);
                default:
                    // Do nothing otherwise
                    return () => { return };
            }
        }

        if (edges.length === 0) {
            // Ignore empty edge lists
            return <></>
        } else if (edges.length === 1) {
            // If there is only one edge between v1 and v2, draw a regular edge
            const e = edges[0];

            return (
                <EdgeGraphic
                    key={`${v1}-${v2}`}
                    source={graph.vertices[e.source]}
                    destination={graph.vertices[e.destination]}
                    edge={e.edge}
                    isDirected={isDirected}
                    onClick={getOnClickEdge(e, mode)}
                />
            );
        } else {
            // If there are many edges between v1 and v2, draw curved edges
            const edgeData = edges.map(e => ({
                edge: e.edge,
                isDirectionReversed: e.source !== v1,
                onClick: getOnClickEdge(e, mode)
            }));

            return (
                <MultiEdgeGraphic
                    key={`${v1}-${v2}`}
                    v1={graph.vertices[v1]}
                    v2={graph.vertices[v2]}
                    edges={edgeData}
                    isDirected={isDirected}
                />
            );
        }
    });

    // Set up info and editor for selected vertex/edge, if any
    let selectedElementEditor = <p>No element selected</p>;
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
        const edgeList = graph.edges[selectedEdge.source]
                         .get(selectedEdge.destination);

        if (edgeList !== undefined) {
            selectedElementEditor = <EditEdgeMenu
                edge={edgeList[selectedEdge.index]} 
                onChangeColor={color => setGraph(
                    changeEdgeColor(graph, selectedEdge.source,
                        selectedEdge.destination, selectedEdge.index, color)
                )}
                onChangeWeight={weight => setGraph(
                    changeEdgeWeight(graph, selectedEdge.source,
                        selectedEdge.destination, selectedEdge.index, weight)
                )}
            />;
        }
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
                        { fromVertex !== null &&
                            <path 
                                className="edgePath"
                                d={`M ${graph.vertices[fromVertex].xpos} 
                                    ${graph.vertices[fromVertex].ypos} 
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
                    <InformationMenu />
                </details>
                <details>
                    <summary>Operations</summary>
                    <OperationsMenu
                        onLineGraph={() => {
                            setSelectedVertex(null);
                            setSelectedEdge(null);
                            setGraph(lineGraph(graph));
                        }}
                        onComplement={() => {
                            setSelectedVertex(null);
                            setSelectedEdge(null);
                            setGraph(complement(graph));
                        }}
                    />
                </details>
                <details>
                    <summary>Generators</summary>
                    <GeneratorsMenu />
                </details>
                <details>
                    <summary>Import/Export</summary>
                    <ImportExportMenu />
                </details>
            </div>
        </div>
    );
}

export default Editor;