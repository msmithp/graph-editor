import type { Edge } from "../types/Graph";

export function getEdgeMidpoint(e: Edge): {x: number, y: number} {
    return {
        x: (e.source.xpos + e.destination.xpos) / 2,
        y: (e.source.ypos + e.destination.ypos) / 2
    };
}