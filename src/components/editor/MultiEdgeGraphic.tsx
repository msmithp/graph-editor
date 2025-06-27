import type { Edge, Vertex } from "../../types/Graph";
import { getMultiEdgeMidpoints } from "../../utils/graphicsUtils";

interface MultiEdgeGraphicProps {
    v1: Vertex,
    v2: Vertex,
    edges: {
        edge: Edge,
        isDirectionReversed: boolean,
        onClick: () => void
    }[],
    isDirected?: boolean
}

function MultiEdgeGraphic({ v1, v2, edges, 
    isDirected }: MultiEdgeGraphicProps) {
    const numEdges = edges.length;
    const pts = getMultiEdgeMidpoints(v1, v2, numEdges);
    const paths = edges.map((e, i) => {
        const [source, destination] = e.isDirectionReversed ?
            [v2, v1] : [v1, v2];

        const shape = `M ${source.xpos} ${source.ypos}
                       Q ${pts[i].x} ${pts[i].y}
                       ${destination.xpos} ${destination.ypos}`;

        return (
            <g 
                className="edgeGraphic"
                onClick={e.onClick}
            >
                {/* Create an invisible path beneath the regular path to make
                    it easier to click */}
                <path 
                    className="edgePath"
                    d={shape}
                    strokeWidth="17"
                    visibility="hidden"
                    pointerEvents="all"
                />

                {/* This is the actual edge */}
                <path 
                    className="edgePath"
                    d={shape}
                    stroke={e.edge.color}
                    fill="none"
                    strokeWidth="2.5"
                    markerEnd={ isDirected ? "url(#arrow)" : undefined}
                />

                {/* Display edge weight, if any */}
                { e.edge.weight !== "" &&
                    <text
                        className="edgeWeight"
                        x={pts[i].x}
                        y={pts[i].y}
                        style={{ userSelect: "none" }}
                    >
                        {e.edge.weight}
                    </text>
                }
            </g>
        );
    });

    return (
        <g>
            {paths}
        </g>
    );
}

export default MultiEdgeGraphic;