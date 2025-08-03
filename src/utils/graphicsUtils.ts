import type { Edge, Vertex } from "../types/Graph";
import type { Point2D } from "../types/Graphics";
import { ARROW_WIDTH, ARROW_HEIGHT, VERTEX_RADIUS,
    CHAR_WIDTH, CHAR_HEIGHT } from "./constants";

/**
 * Get the midpoint between two vertices
 * @param v1 First vertex
 * @param v2 Second vertex
 * @returns Midpoint between `v1` and `v2` as x- and y-coordinates
 */
export function getEdgeMidpoint(v1: Vertex, v2: Vertex): Point2D {
    return getMidpoint(
        { x: v1.xpos, y: v1.ypos },
        { x: v2.xpos, y: v2.ypos }
    );
}

/**
 * Get the midpoint between two points
 * @param p1 First point
 * @param p2 Second point
 * @returns Midpoint between `p1` and `p2`
 */
function getMidpoint(p1: Point2D, p2: Point2D): Point2D {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
}

/**
 * Given two points `p1` and `p2`, get the point 1 unit away from `p2`
 * on the line perpendicular to `p1-p2`
 * @param p1 First point
 * @param p2 Second point
 * @param counterclockwise `true` if the new point faces counterclockwise,
 *                         `false` otherwise
 * @returns New point that is 1 unit away from `p2` on the line perpendicular
 *          to `p1-p2` in the direction specified by `clockwise`
 */
export function getPerpendicularPoint(p1: Point2D, p2: Point2D,
    counterclockwise: boolean = true): Point2D {
    // Handle cases where `p1` and `p2` have the same x- or y-coordinates
    // separately to avoid division by zero
    if (p1.x === p2.x && p1.y === p2.y) {
        return p1;
    }

    if (counterclockwise) {
        if (p1.x === p2.x) {
            if (p1.y > p2.y) {
                return { x: p2.x - 1, y: p2.y };
            } else {
                return { x: p2.x + 1, y: p2.y };
            }
        } else if (p1.y === p2.y) {
            if (p1.x > p2.x) {
                return { x: p2.x, y: p2.y + 1 };
            } else {
                return { x: p2.x, y: p2.y - 1 };
            }
        }
    } else {
        if (p1.x === p2.x) {
            if (p1.y > p2.y) {
                return { x: p2.x + 1, y: p2.y };
            } else {
                return { x: p2.x - 1, y: p2.y };
            }
        } else if (p1.y === p2.y) {
            if (p1.x > p2.x) {
                return { x: p2.x, y: p2.y - 1 };
            } else {
                return { x: p2.x, y: p2.y + 1 };
            }
        }
    }

    // Get negative inverse of slope as a vector
    const rise = p2.y - p1.y;
    const run = p2.x - p1.x;
    const invSlopeVector = [rise, -run];

    // Normalize negative inverse of slope to get unit vector
    const unitVector = vectorDivide(
        invSlopeVector, 
        vectorNorm(invSlopeVector)
    );

    // Get vector corresponding to point 1 unit away from `p2` on a
    // perpendicular line
    const perpendicular = vectorAdd(
        [p2.x, p2.y],
        counterclockwise ? unitVector : vectorMultiply(unitVector, -1)
    );

    return {
        x: perpendicular[0],
        y: perpendicular[1]
    }
}

/**
 * Get an array of control points for Bezier curves between two vertices
 * @param v1 Source vertex
 * @param v2 Destination vertex
 * @param numEdges Number of edges between `v1` and `v2`
 * @returns Array of control points
 */
export function getMultiEdgeMidpoints(v1: Vertex, v2: Vertex, 
    edges: Edge[]): Point2D[] {
    const numEdges = edges.length;
    if (numEdges < 2) {
        throw new Error("Must have at least two edges");
    }

    if (v1.xpos === v2.xpos && v1.ypos === v2.ypos) {
        // If vertices overlap, hide edges
        return new Array(numEdges).fill({ x: v1.xpos, y: v1.ypos })
    }

    // Get length of longest weight string
    const maxLength = Math.max(...(edges.map(e => e.weight.length)));

    // Get distance from the midpoint to the left or right
    const SPACING_WIDTH = 12
    const MIN_SPACING = 2
    const distanceFromMid = numEdges > 2 ? (
        numEdges * SPACING_WIDTH * Math.max(MIN_SPACING, maxLength)
    ) : (
        // If only two edges are present, no need to worry about making things
        // proportional with text lengths
        numEdges * SPACING_WIDTH * MIN_SPACING
    );

    // Start by getting midpoint between the two vertices
    const midpoint = getEdgeMidpoint(v1, v2);

    if (v1.ypos === v2.ypos) {
        // To avoid division by 0, if the two vertices are at the same
        // y-position, return early. Switch order of midpoint y-coordinates
        // based on the x-coordinates of the vertices to maintain correct
        // drawing order.
        if (v1.xpos >= v2.xpos) {
            return getNPointsOnLine(
                midpoint.x, midpoint.y + distanceFromMid,
                midpoint.x, midpoint.y - distanceFromMid,
                numEdges
            );
        } else {
            return getNPointsOnLine(
                midpoint.x, midpoint.y - distanceFromMid,
                midpoint.x, midpoint.y + distanceFromMid,
                numEdges
            );
        }
    }

    // Get negative inverse of slope as a vector
    const rise = v2.ypos - v1.ypos;
    const run = v2.xpos - v1.xpos;
    const invSlopeVector = [rise, -run];

    // Normalize negative inverse of slope to get unit vector
    const unitVector = vectorDivide(
        invSlopeVector, 
        vectorNorm(invSlopeVector)
    );

    // Get left point by adding the unit vector to the midpoint vector,
    // multiplied by the desired distance from the midpoint
    const left = vectorAdd(
        [midpoint.x, midpoint.y],
        vectorMultiply(unitVector, distanceFromMid)
    );

    // Get right point by adding the unit vector to the midpoint vector,
    // multiplied by the negative desired distance from the midpoint
    const right = vectorAdd(
        [midpoint.x, midpoint.y],
        vectorMultiply(unitVector, -distanceFromMid)
    );

    // Get points between leftmost and rightmost points
    return getNPointsOnLine(
        left[0], left[1],
        right[0], right[1],
        numEdges
    );
}

interface ArrowPoints {
    left: Point2D,
    right: Point2D,
    middle: Point2D
}

/**
 * Calculate the coordinates necessary to draw a triangle at the end of an edge
 * to represent the arrow head of a directed edge
 * @param source Source vertex of edge
 * @param destination Destination vertex of edge
 * @returns x- and y-coordinates of the middle (arrow tip), left (left end of
 * base), and right (right end of base) points of a triangle to draw on a
 * directed graph edge
 */
export function getDirectedEdgeArrowPoints(source: Vertex, 
    destination: Vertex): ArrowPoints {
    if (source.xpos === destination.xpos
        && source.ypos === destination.ypos) {
        // Return coordinates of first point to avoid division by 0
        const default_coords = { x: source.xpos, y: source.ypos };
        return {
            left: default_coords,
            right: default_coords,
            middle: default_coords
        };
    }

    const arrowTipPoint = getDirectedEdgeArrowTipPoint(source, destination);
    return getArrowPointsOnLine(
        { x: source.xpos, y: source.ypos },
        arrowTipPoint
    );
}

/**
 * Get the tip point of a directed edge's arrow head. The location of the tip
 * is based on the radius of the vertex graphics.
 * @param source Source vertex of edge
 * @param destination Destination vertex of edge
 * @returns x- and y-coordinates of the middle point at which an arrow head
 *          will be drawn
 */
function getDirectedEdgeArrowTipPoint(source: Vertex,
    destination: Vertex): Point2D {
    // Note that we consider the destination to be the first point and the
    // source to be the second point so that we are basing the distance
    // traveled on the position of the destination vertex, which is where the
    // arrow will be drawn
    return getPointOnLine(destination.xpos, destination.ypos,
        source.xpos, source.ypos, VERTEX_RADIUS);
}

/**
 * Get the three points necesary to draw an arrow head on the line formed from
 * the points `p1` and `p2`. The arrow head will be drawn such that the tip of
 * the arrow is placed precisely at `p2` while the base of the arrow head will
 * be between `p1` and `p2`.
 * @param p1 First point
 * @param p2 Second point
 * @returns Three points which form a triangle (i.e., an arrow head)
 */
function getArrowPointsOnLine(p1: Point2D, p2: Point2D): ArrowPoints {
    if (p1.x === p2.x && p1.y === p2.y) {
        // Return coordinates of first point to avoid division by 0
        const default_coords = { x: p1.x, y: p1.y };
        return {
            left: default_coords,
            right: default_coords,
            middle: default_coords
        };
    }

    const arrowTipPoint = p2;
    const arrowBasePoint = getPointOnLine(p2.x, p2.y, p1.x, p1.y,
        ARROW_HEIGHT);
    
    if (p1.y === p2.y) {
        // To avoid division by 0, if the two vertices are at the same
        // y-position, return early
        return {
            left: {
                x: arrowBasePoint.x,
                y: arrowBasePoint.y + ARROW_WIDTH/2
            },
            right: {
                x: arrowBasePoint.x,
                y: arrowBasePoint.y - ARROW_WIDTH/2
            },
            middle: arrowTipPoint
        }
    }

    // Get negative inverse of slope as a vector
    const rise = p2.y - p1.y;
    const run = p2.x - p1.x;
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
        vectorMultiply(unitVector, ARROW_WIDTH/2)
    );

    // Get right point of arrow head by subtracting the unit vector from the
    // arrow base point vector, multiplied by a constant
    const right = vectorAdd(
        [arrowBasePoint.x, arrowBasePoint.y],
        vectorMultiply(unitVector, -ARROW_WIDTH/2)
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
 * Calculate the coordinates necessary to draw a triangle at the end of a
 * Bezier curve
 * @param p0 Start point
 * @param p1 Control point
 * @param p2 End point
 * @returns Three points which form an arrow head
 */
export function getBezierArrowPoints(p0: Point2D, p1: Point2D,
    p2: Point2D): ArrowPoints {
    // Hide arrow heads if start and end points overlap
    if (p0.x === p2.x && p0.y === p2.y) {
        const default_coords = { x: p0.x, y: p0.y };
        return {
            left: default_coords,
            right: default_coords,
            middle: default_coords
        };
    }

    const EPSILON = 0.1

    const B = createQuadraticBezierFunction(p0, p1, p2);
    const t = getTFromPoint(B, { x: p2.x, y: p2.y },
        VERTEX_RADIUS, EPSILON);
    const arrowLineStart = getBezierSecantPointFromT(B, t);
    const arrowLineEnd = B(t);

    return getArrowPointsOnLine(arrowLineStart, arrowLineEnd);
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
 * Calculate the coordinates of n equidistant points on the line between two
 * other points
 * @param x1 x-coordinate of first point
 * @param y1 y-coordinate of first point
 * @param x2 x-coordinate of second point
 * @param y2 y-coordinate of second point
 * @param n Number of points to find on the line
 * @returns Array of length `n` consisting of x- and y-coordinates of points
 *          on the line
 */
function getNPointsOnLine(x1: number, y1: number, x2: number, y2: number,
    n: number): Point2D[] {
    if (n < 2) {
        throw new Error("Must have at least two points");
    }

    // Points are equidistant, where `sep` is the amount of space between them
    const totalLength = distance(x1, y1, x2, y2);
    const sep = totalLength / (n-1);

    // Get unit vector from first point to second
    const norm = vectorNorm([
        x2 - x1,
        y2 - y1
    ]);

    const unitVector = vectorDivide([
        x2 - x1,
        y2 - y1
    ], norm);

    // Create array of points
    const pts = new Array(n);
    for (let i = 0; i < n; i++) {
        // Get point that is `i` * `sep` units from the first point
        const pt = vectorAdd(
            [x1, y1],
            vectorMultiply(unitVector, i*sep)
        );

        pts[i] = {
            x: pt[0],
            y: pt[1]
        };
    }

    return pts;
}

/**
 * Get the distance between two points
 * @param x1 x-coordinate of first point
 * @param y1 y-coordinate of first point
 * @param x2 x-coordinate of second point
 * @param y2 y-coordinate of second point
 * @returns Distance between points
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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

/**
 * Create a quadratic Bezier function given a start point (`p0`), control point
 * (`p1`), and end point (`p2`) which takes a value `t` between 0 and 1 and
 * returns a point on the Bezier curve
 * @param p0 Start point
 * @param p1 Control point
 * @param p2 End point
 * @returns Bezier function
 */
function createQuadraticBezierFunction(p0: Point2D, p1: Point2D, p2: Point2D):
    (t: number) => Point2D {
    /*
     * This implements the following mathematical function:
     * B(t) = (1 - t)^2 * P_0 + 2t(1 - t) * P_1 + t^2 * P_2
     * where P_0, P_1, and P_2 are 2D vectors
     */
    return (t: number) => {
        const term1 = vectorMultiply([p0.x, p0.y], (1 - t) ** 2);
        const term2 = vectorMultiply([p1.x, p1.y], 2 * t * (1 - t));
        const term3 = vectorMultiply([p2.x, p2.y], t**2);
        const sum = vectorAdd(term1, vectorAdd(term2, term3));

        return {
            x: sum[0],
            y: sum[1]
        }
    }
}

/**
 * Approximate the value of `t` for which `B(t)` is `dist` units away from
 * `pt`, within `epsilon` units
 * @param B Quadratic Bezier function, which takes a value `t` between 0 and 1
 *          as input and outputs a point on the plane
 * @param pt Point on the plane
 * @param dist Distance between `B(t)` and `pt`
 * @param epsilon Tolerance for `dist`
 * @returns Value of `t` for which `B(t)` is `dist` units away from `pt`
 */
function getTFromPoint(B: (t: number) => Point2D, pt: Point2D, dist: number,
    epsilon: number): number {
    const MAX_ITERATIONS = 20;
    let hi = 1;
    let lo = 0;
    let t = 0.5;

    // Binary search for the value of `t` by starting in the middle of the
    // Bezier curve and eliminating half of the curve from consideration each
    // iteration until `B(t)` is `dist` units away from `pt`, within `epsilon`
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        t = (hi + lo) / 2;
        // console.log(`i=${i}\thi=${hi}\tlo=${lo}\thi-lo=${hi-lo}\tt=${t}`);
        const bezierPt = B(t);
        const currentDistance = distance(bezierPt.x, bezierPt.y, pt.x, pt.y);

        if (Math.abs(currentDistance - dist) <= epsilon) {
            // Distance between `B(t)` and `pt` is within `epsilon` of
            // desired distance, so return `t`
            return t;
        } else if (currentDistance > dist) {
            // Move search area to half of current arc closest to end point
            lo += 1 / (2 ** (i+1));
        } else {
            // Move search area to half of current arc closest to start point
            hi -= 1 / (2 ** (i+1));
        }
    }

    return t;
}

/**
 * Get a point `B(t')` on the Bezier curve such that `t' = t - epsilon`,
 * forming a secant line between `B(t)` and `B(t')`
 * @param B Quadratic Bezier function, which takes a value `t` between 0 and 1
 *          as input and outputs a point on the plane
 * @param t Input value for Bezier function `B`
 * @param epsilon Difference between `t` and the input value for `B` used to
 *                get the second point of the secant line
 * @returns Point on the Bezier curve very close to `B(t)`
 */
function getBezierSecantPointFromT(B: (t: number) => Point2D, t: number,
    epsilon: number = 0.1): Point2D {
    return B(t - epsilon);
}

/**
 * Get the point in the middle of a quadratic Bezier curve
 * @param p0 Start point
 * @param p1 Control point
 * @param p2 End point
 * @returns Middle point of quadratic Bezier curve
 */
export function getQuadraticBezierMidpoint(p0: Point2D, p1: Point2D,
    p2: Point2D): Point2D {
    const B = createQuadraticBezierFunction(p0, p1, p2);
    return B(0.5);
}

/**
 * Get the point at which an edge's weight should be drawn
 * @param source Source vertex
 * @param destination Destination vertex
 * @param weight Edge weight
 * @returns Point where edge weight text should be drawn
 */
export function getEdgeWeightLocation(source: Vertex,
    destination: Vertex, weight: string): Point2D {
    return getEdgeWeightLocationFromPoints(
        { x: source.xpos, y: source.ypos },
        { x: destination.xpos, y: destination.ypos },
        weight
    );
}

/**
 * Get the point at which an edge's weight should be drawn, given two points
 * @param p1 First point
 * @param p2 Second point
 * @param weight Edge weight
 * @returns Point where edge weight text should be drawn
 */
function getEdgeWeightLocationFromPoints(p1: Point2D, p2: Point2D,
    weight: string): Point2D {
    if (p1.x === p2.x && p1.y === p2.y) {
        return p1;
    }

    // Rough width of edge weight text object
    const textWidth = weight.length * CHAR_WIDTH;

    // Padding added between edge weight and edge line
    const PADDING = 10;

    // Using the angle between p1 and p2, get a constant `c` between 0 and 1
    // such that c = 0 when p1 and p2 are at the same y-value and c = 1 when
    // p1 and p2 are at the same x-value. This ensures that no distance is
    // placed between the text and the edge when the edge line is horizontal,
    // and maximum distance is placed between the text and the edge when the
    // edge line is vertical.
    const theta = radiansToDegrees(angleBetweenPoints(p1, p2));
    const c = Math.sin(degreesToRadians(theta % 180));

    // Distance away from the edge that the text should be
    const dist = (textWidth / 2) * c;

    const midpoint = getMidpoint(p1, p2);
    const perpendicularPoint = getPerpendicularPoint(p1, midpoint);
    
    const weightPt = getPointOnLine(
        midpoint.x, midpoint.y,
        perpendicularPoint.x, perpendicularPoint.y,
        dist + PADDING
    );

    // Vertical offset to account for the fact that the "anchor" of the text
    // object is at the bottom of the text rather than the middle
    weightPt.y += CHAR_HEIGHT;

    return weightPt;
}

/**
 * Convert radians to degrees
 * @param radians Radian value
 * @returns Equivalent value in degrees
 */
function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Convert degreres to radians
 * @param degrees Degree value
 * @returns Equivalent value in radians
 */
function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Given two points `(x1, y1)` and `(x2, y2)`, return the angle between the
 * line `y = y1` and the point `(x2, y2)`, in radians
 * @param p1 First point `(x1, y1)`
 * @param p2 Second point `(x2, y2)`
 * @returns Angle between `p1` and `p2`
 */
function angleBetweenPoints(p1: Point2D, p2: Point2D): number {
    const x = p2.x - p1.x;
    // Subtract p2.y from p1.y since y value increases as point gets lower,
    // not higher
    const y = p1.y - p2.y;
    const theta = Math.atan2(y, x);

    if (theta < 0) {
        // Convert negative angle to value between 0 and 2 * pi
        return 2 * Math.PI + theta;
    } else {
        return theta;
    }
}

/**
 * Get the points at which all edges' weights should be drawn between two
 * vertices
 * @param v1 First vertex
 * @param v2 Second vertex
 * @param weights Weight labels
 * @param controlPts Bezier curve control points
 * @returns Array of points at which edge weights should be drawn
 */
export function getMultiEdgeWeightLocations(v1: Vertex, v2: Vertex,
    weights: string[], controlPts: Point2D[]): Point2D[] {
    return getMultiEdgeWeightLocationsFromPoints(
        { x: v1.xpos, y: v1.ypos },
        { x: v2.xpos, y: v2.ypos },
        weights,
        controlPts
    );
}

/**
 * Get the points at which all edges' weights should be drawn between two
 * points
 * @param p1 First point
 * @param p2 Second point
 * @param weights Weight labels
 * @param controlPts Bezier curve control points
 * @returns Array of points at which edge weights should be drawn
 */
function getMultiEdgeWeightLocationsFromPoints(p1: Point2D, p2: Point2D,
    weights: string[], controlPts: Point2D[]): Point2D[] {
    const numEdges = controlPts.length;

    if (numEdges < 2) {
        throw new Error("Must have at least two edges");
    }

    const EPSILON = 0.01;
    const weightPts = new Array(numEdges);

    // Weights for first half of points, inclusive, are drawn counterclockwise
    for (let i = 0; i < Math.ceil(numEdges / 2); i++) {
        const B = createQuadraticBezierFunction(p1, controlPts[i], p2);
        const firstPt = B(0.5 - EPSILON);
        const secondPt = B(0.5 + EPSILON);
        weightPts[i] = getEdgeWeightLocationFromPoints(firstPt, secondPt, weights[i]);
    }

    // Weights for second half of points are drawn clockwise
    for (let i = Math.ceil(numEdges / 2); i < numEdges; i++) {
        const B = createQuadraticBezierFunction(p1, controlPts[i], p2);
        const firstPt = B(0.5 + EPSILON);
        const secondPt = B(0.5 - EPSILON);
        weightPts[i] = getEdgeWeightLocationFromPoints(firstPt, secondPt, weights[i]);
    }

    return weightPts;
}