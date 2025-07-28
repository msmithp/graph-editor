import type { Edge, Vertex } from "../../types/Graph";
import { EDGE_WIDTH, INVISIBLE_EDGE_WIDTH } from "../../utils/constants";
import { getDirectedEdgeArrowPoints, getEdgeMidpoint } from "../../utils/graphicsUtils";

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

    const arrowPts = getDirectedEdgeArrowPoints(source, destination);

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
                strokeWidth={INVISIBLE_EDGE_WIDTH}
                visibility="hidden"
                pointerEvents="all"
            />

            {/* This is the actual edge */}
            <path 
                className="edgePath"
                d={`M ${source.xpos} ${source.ypos} 
                    L ${destination.xpos} ${destination.ypos}`}
                stroke={edge.color}
                fill="none"
                strokeWidth={EDGE_WIDTH}
            />

            {/* Display arrow head if graph is directed */}
            { isDirected === true && 
                <polygon
                    points={`${arrowPts.left.x}, ${arrowPts.left.y}
                             ${arrowPts.middle.x}, ${arrowPts.middle.y}
                             ${arrowPts.right.x}, ${arrowPts.right.y}`}
                    fill={edge.color}
                />
            }

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