import type { Edge, Vertex } from "../../types/Graph";
import { 
    getDirectedEdgeEnd, getEdgeMidpoint
} from "../../utils/graphicsUtils";

interface EdgeProps {
    source: Vertex,
    destination: Vertex,
    edge: Edge
    isDirected?: boolean,
    onClick: () => void
}

function EdgeGraphic({ source, destination, edge,
    isDirected, onClick }: EdgeProps) {
    const midpoint = getEdgeMidpoint(source, destination);
    const endpoint = isDirected ? 
        getDirectedEdgeEnd(source, destination) : 
        { x: destination.xpos, y: destination.ypos };

    return (
        <g 
            className="edgeGraphic"
            onClick={_ => onClick()}
        >
            {/* Create an invisible path beneath the regular path to make it
                easier to click */}
            <path 
                className="edgePath"
                d={`M ${source.xpos} ${source.ypos} 
                    L ${destination.xpos} ${destination.ypos}`}
                strokeWidth="17"
                visibility="hidden"
                pointerEvents="all"
            >
            </path>

            {/* This is the actual edge */}
            <path 
                className="edgePath"
                d={`M ${source.xpos} ${source.ypos} 
                    L ${endpoint.x} ${endpoint.y}`}
                stroke={edge.color}
                strokeWidth="2.5"
                markerEnd={ isDirected ? "url(#arrow)" : undefined}
            >
            </path>

            {/* Display edge weight, if any */}
            { edge.weight !== "" &&
                <text
                    className="edgeWeight"
                    x={midpoint.x}
                    y={midpoint.y}
                    style={{ userSelect: "none" }}
                >
                    {edge.weight}
                </text>
            }
        </g>
    )
}

export default EdgeGraphic;