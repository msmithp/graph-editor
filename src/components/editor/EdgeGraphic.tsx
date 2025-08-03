import type { Edge, Vertex } from "../../types/Graph";
import { EDGE_WIDTH, INVISIBLE_EDGE_WIDTH } from "../../utils/constants";
import {
    getDirectedEdgeArrowPoints,
    getEdgeWeightLocation
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
    const weightPt = getEdgeWeightLocation(source, destination, edge.weight);

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
                <g className="edgeWeight">
                    <text
                        className="edgeWeight"
                        x={weightPt.x}
                        y={weightPt.y}
                        style={{ userSelect: "none", textAnchor: "middle" }}
                    >
                        {edge.weight}
                    </text>
                </g>
            }
        </g>
    )
}

export default EdgeGraphic;