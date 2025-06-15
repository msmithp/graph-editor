const STROKE_WIDTH = 1;
const STROKE_COLOR = "#BBBBBB";

interface GridProps {
    width: number,
    height: number,
    base: number
}

function Grid({ width, height, base }: GridProps) {
    let gridLines = [];

    // Generate vertical lines
    for (let i = 0; i <= width; i += base) {
        gridLines.push(
            <path
                key={`v${i}`}
                d={`M ${i} 0 L ${i} ${height}`}
                strokeWidth={STROKE_WIDTH}
                stroke={STROKE_COLOR}
            />
        );
    }

    // Generate horizontal lines
    for (let i = 0; i <= height; i += base) {
        gridLines.push(
            <path
                key={`h${i}`}
                d={`M 0 ${i} L ${width} ${i}`}
                strokeWidth={STROKE_WIDTH}
                stroke={STROKE_COLOR}
            />
        );
    }

    return (
        <g className="grid">
            {gridLines}
        </g>
    );
}

export default Grid;