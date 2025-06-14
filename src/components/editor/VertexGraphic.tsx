import React, { useState, memo } from "react";
import type { Vertex } from "../../types/Graph";
import type { Mode } from "../../types/Menu";
import { getSVGPoint } from "../../utils/utils";
import { VERTEX_RADIUS } from "../../utils/constants";


const STROKE_WIDTH = "0.2em";

interface VertexGraphicProps {
    vertex: Vertex,
    mode: Mode,
    updateLocation: (x: number, y: number) => void,
    onClick: () => void
}

function VertexGraphic(
    { vertex, mode, updateLocation, onClick }: VertexGraphicProps
) {
    const [dragging, setDragging] = useState(false);
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    function handlePointerDown(event: React.PointerEvent<SVGGElement>): void {
        // Get client x- and y-coordinates at location of click
        const point = getSVGPoint(event.currentTarget.ownerSVGElement!, 
            event.clientX, event.clientY);

        // Set origin to location of click
        setOrigin({ x: point.x, y: point.y });

        // Set starting position to original location of vertex
        setStartPos({ x: vertex.xpos, y: vertex.ypos });
        setDragging(true);

        // Capture all further pointer events on this element
        event.currentTarget.setPointerCapture(event.pointerId);
        event.stopPropagation();
    }

    function handlePointerMove(event: React.PointerEvent<SVGGElement>): void {
        if (dragging) {
            // Get client x- and y-coordinates at location of pointer
            const point = getSVGPoint(event.currentTarget.ownerSVGElement!,
                event.clientX, event.clientY);

            // Calculate how far vertex has traveled from where it started
            const dx = point.x - origin.x;
            const dy = point.y - origin.y;

            // Calculate new coordinates
            const newX = startPos.x + dx;
            const newY = startPos.y + dy;

            // Update vertex location in graph
            updateLocation(newX, newY);
        }
    }

    function handlePointerUp(event: React.PointerEvent<SVGGElement>): void {
        if (dragging) {
            setDragging(false);

            // Stop capturing pointer events
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }

    return (
        <g
            onPointerDown={(e) => {
                onClick();
                if (mode === "MOVE") {
                    handlePointerDown(e);
                }
            }}
            onPointerMove={mode === "MOVE" ? handlePointerMove : undefined}
            onPointerUp={mode === "MOVE" ? handlePointerUp : undefined}
            onPointerLeave={mode === "MOVE" ? handlePointerUp : undefined}
            className="vertexGraphic"
        >
            <circle
                className="vertexCircle"
                cx={vertex.xpos}
                cy={vertex.ypos}
                r={VERTEX_RADIUS}
                fill={vertex.color}
                stroke="black"
                strokeWidth={STROKE_WIDTH}
            />
            <text
                className="vertexLabel"
                x={vertex.xpos}
                y={vertex.ypos}
                textAnchor="middle"
                dy=".35em"
                fontWeight="bold"
                style={{ userSelect: "none" }}
            >
                {vertex.label}
            </text>
        </g>
    )
}

export default memo(VertexGraphic);
