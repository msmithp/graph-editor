import type { Edge } from "../../types/Graph";

interface EdgeProps {
    edge: Edge
    isDirected?: boolean,
    onClick: () => void
}

function EdgeGraphic({ edge, isDirected, onClick }: EdgeProps) {
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