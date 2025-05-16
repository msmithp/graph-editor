import type { Edge } from "../../types/Graph";

interface EdgeProps {
    edge: Edge
    isDirected?: boolean
}

function EdgeGraphic({ edge, isDirected }: EdgeProps) {
    return (
        <g className="edgeGraphic">
            <path 
                className="edgePath"
                d={`M ${edge.source.xpos} ${edge.source.ypos} 
                    L ${edge.destination.xpos} ${edge.destination.ypos}`}
                stroke="black"
                strokeWidth="2.5"
            >
            </path>
            { edge.weight !== "" &&
                <text
                    className="edgeWeight"
                    x={edge.source.xpos}
                    y={edge.source.ypos}
                >
                    {edge.weight}
                </text>
            }
        </g>
    )
}

export default EdgeGraphic;