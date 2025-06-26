import type { Edge, Graph, Vertex } from "../types/Graph";
import type { Point2D } from "../types/Graphics";
import { VERTEX_RADIUS } from "./constants";

/**
 * Get the midpoint between two vertices
 * @param v1 First vertex
 * @param v2 Second vertex
 * @returns Midpoint between `v1` and `v2` as x- and y-coordinates
 */
export function getEdgeMidpoint(v1: Vertex, v2: Vertex): Point2D {
    return {
        x: (v1.xpos + v2.xpos) / 2,
        y: (v1.ypos + v2.ypos) / 2
    };
}

interface ArrowPoints {
    left: Point2D,
    right: Point2D,
    middle: Point2D
}

/**
 * Calculate the coordinates necessary to draw a triangle at the end of an edge
 * to represent the arrow head of a directed edge
 * @param e Directed edge
 * @returns x- and y-coordinates of the middle (arrow tip), left (left end of
 * base), and right (right end of base) points of a triangle to draw on a
 * directed graph edge
 */
export function getDirectedEdgeArrowPoints(e: Edge): ArrowPoints {
    if (e.source.xpos === e.destination.xpos 
        && e.source.ypos === e.destination.ypos) {
        // Return coordinates of source vertex to avoid division by 0
        const default_coords = { x: e.source.xpos, y: e.source.ypos };
        return {
            left: default_coords,
            right: default_coords,
            middle: default_coords
        };
    }

    // Distance from top of arrow head to bottom of arrow head
    const ARROW_HEIGHT = 15;

    // Distance from left side of arrow head to right side of arrow head
    const ARROW_BASE_LENGTH = 15;

    // Get tip and base points of arrow head
    const arrowTipPoint = getDirectedEdgeArrowTipPoint(e);
    const arrowBasePoint = getPointOnLine(arrowTipPoint.x, arrowTipPoint.y,
        e.source.xpos, e.source.ypos, ARROW_HEIGHT);

    if (e.source.ypos === e.destination.ypos) {
        // To avoid division by 0, if the two vertices are at the same
        // y-position, return early
        return {
            left: {
                x: arrowBasePoint.x,
                y: arrowBasePoint.y + ARROW_BASE_LENGTH/2
            },
            right: {
                x: arrowBasePoint.x,
                y: arrowBasePoint.y - ARROW_BASE_LENGTH/2
            },
            middle: arrowTipPoint
        };
    }

    // Get negative inverse of slope as a vector
    const rise = e.destination.ypos - e.source.ypos;
    const run = e.destination.xpos - e.source.xpos;
    const invSlopeVector = [rise, -run];

    // Normalize negative inverse of slope to get unit vector
    const unitVector = vectorDivide(
        invSlopeVector, 
        vectorNorm(invSlopeVector)
    );

    // Get left point of arrow head by adding the unit vector to the arrow base
    // point vector, multiplied by a constant
    const left = vectorAdd(
        [arrowBasePoint.x, arrowBasePoint.y],
        vectorMultiply(unitVector, ARROW_BASE_LENGTH/2)
    );

    // Get right point of arrow head by subtracting the unit vector from the
    // arrow base point vector, multiplied by a constant
    const right = vectorAdd(
        [arrowBasePoint.x, arrowBasePoint.y],
        vectorMultiply(unitVector, -ARROW_BASE_LENGTH/2)
    );

    return {
        left: {
            x: left[0],
            y: left[1]
        },
        right: {
            x: right[0],
            y: right[1]
        },
        middle: arrowTipPoint
    };
}

/**
 * Get the middle point of a directed edge, which will be used to draw an
 * arrow point to the destination vertex. The middle point is where the arrow
 * head will be drawn. The location of the middle point is based on the radius
 * of the vertex graphics.
 * @param e Directed edge
 * @returns x- and y-coordinates of the middle point at which an arrow head
 *          will be drawn
 */
function getDirectedEdgeArrowTipPoint(e: Edge): { x: number, y: number } {
    // Note that we consider the destination to be the first point and the
    // source to be the second point so that we are basing the distance
    // traveled on the position of the destination vertex, which is where the
    // arrow will be drawn
    return getPointOnLine(e.destination.xpos, e.destination.ypos,
        e.source.xpos, e.source.ypos, VERTEX_RADIUS);
}

/**
 * Calculate the coordinates of a point that is on the line between two other
 * points, some distance away from the first point
 * @param x1 x-coordinate of first point
 * @param y1 y-coordinate of first point
 * @param x2 x-coordinate of second point
 * @param y2 y-coordinate of second point
 * @param distance Distance from the first point that the returned point will
 *                 be
 * @returns x- and y-coordinates of the point that is `distance` units away
 *          from the first point
 */
function getPointOnLine(x1: number, y1: number, 
    x2: number, y2: number, distance: number) {
    // Throughout this function, we think of the coordinates of the source and
    // destination points as 2D vectors. First, we get the norm of the vector
    // that results from subtracting the destination vector from the source
    // vector.
    const norm = vectorNorm([
        x2 - x1,
        y2 - y1
    ]);

    // Next, we divide the difference vector by the norm to normalize it.
    const unitVector = vectorDivide([
        x2 - x1,
        y2 - y1
    ], norm);

    // Next, we find the vector which represents the point between the source
    // and destination.
    // This is calculated as v_{destination} + (d * u), where:
    //      * v_{destination} is the vector representing the coordinates of the
    //        destination point
    //      * d is the distance we want to move away from the destination point
    //      * u is the unit vector
    const middleVector = vectorAdd(
        [x1, y1],
        vectorMultiply(unitVector, distance)
    );

    // Return the first and second values of the middle vector, which represent
    // x- and y-coordinates
    return {
        x: middleVector[0],
        y: middleVector[1]
    };
}

/**
 * Add two vectors of the same length, element-by-element
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Sum vector
 */
function vectorAdd(v1: number[], v2: number[]): number[] {
    if (v1.length !== v2.length) {
        throw new Error("Can't add two vectors of different lengths");
    }

    let sum = new Array<number>(v1.length);

    for (let i = 0; i < v1.length; i++) {
        sum[i] = v1[i] + v2[i];
    }

    return sum;
}

/**
 * Multiply each element of a vector by a constant
 * @param v Vector
 * @param c Constant by which each element of `v` will be multiplied
 * @returns Multiplied vector
 */
function vectorMultiply(v: number[], c: number): number[] {
    return v.map(x => x * c);
}

/**
 * Divide each element of a vector by a constant
 * @param v Vector
 * @param c Nonzero constant by which each element of `v` will be divided
 * @returns Divided vector
 */
function vectorDivide(v: number[], c: number): number[] {
    if (c === 0) {
        throw new Error("Division by 0");
    }

    return vectorMultiply(v, 1/c);
}

/**
 * Calculate the norm of a vector
 * @param v Vector
 * @returns Norm of vector
 */
function vectorNorm(v: number[]): number {
    let norm = 0;

    for (const x of v) {
        norm += Math.pow(x, 2);
    }

    return Math.sqrt(norm);
}