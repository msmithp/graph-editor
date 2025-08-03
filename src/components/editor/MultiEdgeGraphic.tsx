import type { Edge, Vertex } from "../../types/Graph";
import { EDGE_WIDTH, INVISIBLE_EDGE_WIDTH } from "../../utils/constants";
import { 
    getBezierArrowPoints, getMultiEdgeMidpoints
} from "../../utils/graphicsUtils";
import { outsideInIndices } from "../../utils/utils";

interface MultiEdgeGraphicProps {
    v1: Vertex,
    v2: Vertex,
    edges: {
        edge: Edge,
        isDirectionReversed: boolean,
        onClick: () => void
    }[],
    isDirected?: boolean
}

function MultiEdgeGraphic({ v1, v2, edges, 
    isDirected }: MultiEdgeGraphicProps) {
    const numEdges = edges.length;

    // Order in which edges will be drawn, corresponding to indices of the
    // `edges` array
    const indices = outsideInIndices(numEdges);

    // Control points for Bezier curves
    const midpoints = getMultiEdgeMidpoints(v1, v2, numEdges);

    // We map using the list of indices so that the multiple edges are drawn
    // from the outside in - ensuring that the larger outer edges do not "cover
    // up" the smaller inner edges and prevent them from being clicked
    const paths = indices.map(i => {
        const e = edges[i];
        const [source, destination] = e.isDirectionReversed ?
            [v2, v1] : [v1, v2];

        const shape = `M ${source.xpos} ${source.ypos}
                       Q ${midpoints[i].x} ${midpoints[i].y}
                       ${destination.xpos} ${destination.ypos}`;
        
        const arrowPts = getBezierArrowPoints(
            { x: source.xpos, y: source.ypos },
            midpoints[i],
            { x: destination.xpos, y: destination.ypos }
        );

        return (
            <g
                key={`${v1.label} ${v2.label} ${i}`}
                className="edgeGraphic"
                onClick={e.onClick}
            >
                {/* Create an invisible path beneath the regular path to make
                    it easier to click */}
                <path 
                    className="edgePath"
                    d={shape}
                    strokeWidth={INVISIBLE_EDGE_WIDTH}
                    visibility="hidden"
                    pointerEvents="all"
                />

                {/* This is the actual edge */}
                <path 
                    className="edgePath"
                    d={shape}
                    stroke={e.edge.color}
                    fill="none"
                    strokeWidth={EDGE_WIDTH}
                />

                {/* Display arrow head if graph is directed */}
                { isDirected === true && 
                    <polygon
                        points={`${arrowPts.left.x}, ${arrowPts.left.y}
                                 ${arrowPts.middle.x}, ${arrowPts.middle.y}
                                 ${arrowPts.right.x}, ${arrowPts.right.y}`}
                        fill={edges[i].edge.color}
                    />
                }

                {/* Display edge weight, if any */}
                { e.edge.weight !== "" &&
                    <g className="edgeWeight">
                        <text
                            className="edgeWeight"
                            x={midpoints[i].x}
                            y={midpoints[i].y}
                            style={{ userSelect: "none", textAnchor: "middle" }}
                        >
                            {e.edge.weight}
                        </text>
                    </g>
                }
            </g>
        );
    });

    return (
        <g>
            {paths}
        </g>
    );
}

export default MultiEdgeGraphic;