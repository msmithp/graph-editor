import type { Vertex } from "../../types/Graph";

const RADIUS = 15;
const STROKE_WIDTH = "0.2em";


interface VertexProps {
    vertex: Vertex
}

function VertexGraphic({ vertex }: VertexProps) {
    return (
        <g 
        onClick={_ => console.log(name)}
        >
            <circle
                cx={vertex.xpos}
                cy={vertex.ypos}
                r={RADIUS}
                fill="white"
                stroke="black"
                strokeWidth={STROKE_WIDTH}
            />
            <text 
                x={vertex.xpos}
                y={vertex.ypos} 
                textAnchor="middle" 
                dy=".35em"
                fontWeight="bold"
                style={{userSelect: "none"}}
            >
                {vertex.label}
            </text>
        </g>
    )
}

export default VertexGraphic;
