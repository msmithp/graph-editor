const RADIUS = 15;


interface VertexProps {
    name: string,
    xpos: number,
    ypos: number
}

function Vertex({ name, xpos, ypos }: VertexProps) {
    return (
        <g 
        onClick={_ => console.log(name)}
        >
            <circle
                cx={xpos}
                cy={ypos}
                r={RADIUS}
                fill="white"
                stroke="black"
                strokeWidth="0.2em"
            />
            <text 
                x={xpos}
                y={ypos} 
                textAnchor="middle" 
                dy=".35em"
                fontWeight="bold"
                style={{userSelect: "none"}}
            >
                {name}
            </text>
        </g>
    )
}

export default Vertex;
