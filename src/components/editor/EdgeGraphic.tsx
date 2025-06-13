import type { Edge } from "../../types/Graph";
import { getDirectedEdgeArrowPoints, getEdgeMidpoint } from "../../utils/graphUtils";

interface EdgeProps {
    edge: Edge
    isDirected?: boolean,
    onClick: () => void
}

function EdgeGraphic({ edge, isDirected, onClick }: EdgeProps) {
    const midpoint = getEdgeMidpoint(edge);
    const arrowPoints = getDirectedEdgeArrowPoints(edge);

    return (
        <g 
            className="edgeGraphic"
            onClick={_ => onClick()}
        >
            {/* Create an invisible path beneath the regular path to make it
                easier to click */}
            <path 
                className="edgePath"
                d={`M ${edge.source.xpos} ${edge.source.ypos} 
                    L ${edge.destination.xpos} ${edge.destination.ypos}`}
                strokeWidth="17"
                visibility="hidden"
                pointerEvents="all"
            >
            </path>

            {/* This is the actual edge */}
            <path 
                className="edgePath"
                d={`M ${edge.source.xpos} ${edge.source.ypos} 
                    L ${edge.destination.xpos} ${edge.destination.ypos}`}
                stroke={edge.color}
                strokeWidth="2.5"
            >
            </path>

            {/* Draw arrow head if edge is directed */}
            { isDirected &&
                <polygon
                    className="edgePath"
                    points={
                        `${arrowPoints.left.x},${arrowPoints.left.y}
                            ${arrowPoints.right.x},${arrowPoints.right.y},
                            ${arrowPoints.middle.x}, ${arrowPoints.middle.y}`
                    }
                    fill={edge.color}
                >
                </polygon>
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