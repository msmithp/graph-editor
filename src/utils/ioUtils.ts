import type { Graph } from "../types/Graph";
import type { GraphJSON, LatexExportSettings } from "../types/IO";

export function toLatex(graph: Graph, isDirected: boolean, 
    settings: LatexExportSettings): string {
    let output = "\\begin{tikzpicture}";
    
    

    output += "\\end{tikzpicture}"
    return output;
}

export function toVertexEdgeList(graph: Graph): string {

}

export function fromVertexEdgeList(list: string): Graph {

}

export function toJson(graph: Graph): GraphJSON {

}

export function fromJson(graphJson: GraphJSON): Graph {

}

