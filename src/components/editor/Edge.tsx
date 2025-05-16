import { Vertex } from "../../types/Graph";

interface EdgeProps {
    source: Vertex,
    destination: Vertex,
    weight?: string
}

function Edge({ source, destination, weight }: EdgeProps) {
    return (
        <g>
            <path d={`M ${source.xpos} ${source.ypos} L ${destination.xpos} ${destination.ypos}`}></path>
            { weight &&
                <text x={source.xpos} y={source.ypos}>{weight}</text>
            }
        </g>
    )
}

export default Edge;