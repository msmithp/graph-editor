export type Mode = "MOVE"               // For moving vertices
                 | "DRAW_VERTICES"      // For drawing new vertices
                 | "DRAW_EDGES"         // For drawing new edges
                 | "ERASE"              // For erasing vertices or edges
                 | "PAINT"              // For coloring vertices/edges
                 | "EYEDROP"            // For swatching colors

export const MODES: Mode[] = ["MOVE",
                              "DRAW_VERTICES",
                              "DRAW_EDGES",
                              "ERASE",
                              "PAINT",
                              "EYEDROP"];
