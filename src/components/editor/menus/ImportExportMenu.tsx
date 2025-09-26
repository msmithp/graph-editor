import { useState, useRef } from "react";
import type { GraphJSON, TikzExportSettings } from "../../../types/IO";
import { toTikz } from "../../../utils/ioUtils";
import type { Graph } from "../../../types/Graph";

interface ImportExportMenuProps {
    graph: Graph,
    onExportJson: () => void,
    onImportJson: (json: GraphJSON | null) => void
}

function ImportExportMenu({ graph, onExportJson, 
    onImportJson }: ImportExportMenuProps) {

    const dialogRef = useRef<HTMLDialogElement>(null);

    function handleJsonUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ): void {
        const files = event.target.files;

        if (files === null || files.length === 0) {
            onImportJson(null);
        } else {
            const file = files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const target = e.target;

                if (target === null || target.result === null) {
                    onImportJson(null);
                } else {
                    const contents = target.result;

                    try {
                        const parsed = JSON.parse(contents as string);
                        const graphJson = parsed as GraphJSON;
                        onImportJson(graphJson);
                    } catch (error) {
                        onImportJson(null);
                    }
                }
            }

            reader.onerror = (_) => onImportJson(null);

            reader.readAsText(file);
        }
    }

    function toggleDialog() {
        if (!dialogRef.current) {
            return;
        }

        dialogRef.current.hasAttribute("open")
            ? dialogRef.current.close()
            : dialogRef.current.showModal();
    }

    return (
        <div className="menuTab">
            <div className="importExportButtons">
                <button onClick={onExportJson}>
                    Download JSON
                </button>

                {/* Invisible <input> tag to upload file */}
                <input 
                    type="file"
                    id="selectedFile"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={e => {handleJsonUpload(e)}}
                />

                {/* Visible <button> tag which clicks the invisible <input>
                    tag (in order to implement one-click file uploading) */}
                <button
                    type="button"
                    onClick={() => {
                        const fileElem = 
                            document.getElementById("selectedFile");
                        if (fileElem) {
                            fileElem.click();
                        } else {
                            onImportJson(null);
                        }
                    }}
                >
                    Import JSON
                </button>
            </div>

            <div className="importExportButtons">
                <button onClick={toggleDialog}>
                    Export to TikZ
                </button>
            </div>
            <dialog ref={dialogRef}>
                <button onClick={toggleDialog}>X</button>
                <TikzForm graph={graph} />
            </dialog>
        </div>
    );
}

interface TikzFormProps {
    graph: Graph
}

function TikzForm({ graph } : TikzFormProps) {
    const [exportText, setExportText] = useState<string>("");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const entries = Object.fromEntries(formData);
        
        const settings = {
            vertexStyle:        entries.vertexStyle,
            showVertexLabels:   entries.showVertexLabels === "on",
            edgeWeightStyle:    entries.edgeWeightStyle,
            slopedEdgeWeight:   entries.slopedEdgeWeight === "on",
            isDirected:         entries.isDirected === "on",
            edgeWidth:          Number(entries.edgeWidth),
            textFormat:         entries.textFormat,
            trimPadding:        true,
            coordinateScale:    1
        } as TikzExportSettings;

        setExportText(toTikz(graph, settings));
    }

    function handleCopy() {
        navigator.clipboard.writeText(exportText);
    }

    return (
        <div>
            <h2>TikZ Export</h2>
            <form onSubmit={(e) => handleSubmit(e)}>
                <div>
                    <h3>Vertices</h3>
                    <div>
                        <label>Vertex style
                            <input type="radio" 
                                id="standard" value="STANDARD"
                                name="vertexStyle" defaultChecked />
                            <label htmlFor="standard">Standard</label>

                            <input type="radio"
                                id="dot" value="DOT" name="vertexStyle" />
                            <label htmlFor="dot">Dot</label>

                            <input type="radio"
                                id="vertexText" value="TEXT"
                                name="vertexStyle" />
                            <label htmlFor="vertexText">Text</label>
                        </label>
                    </div>

                    <div>
                        <label htmlFor="showVertexLabels">
                            Show vertex labels
                        </label>
                        <input type="checkbox" id="showVertexLabels"
                            name="showVertexLabels" defaultChecked />
                    </div>
                </div>

                <div>
                    <h3>Edges</h3>
                    <div>
                        <label>Edge weight style
                            <input type="radio"
                                id="outside" value="OUTSIDE"
                                name="edgeWeightStyle" defaultChecked />
                            <label htmlFor="outside">Outside</label>

                            <input type="radio"
                                id="inside" value="INSIDE" 
                                name="edgeWeightStyle" />
                            <label htmlFor="inside">Inside</label>
                        </label>
                    </div>

                    <div>
                        <label htmlFor="isDirected">Directed edges</label>
                        <input type="checkbox" id="isDirected" 
                            name="isDirected" />
                    </div>

                    <div>
                        <label htmlFor="slopedEdgeWeight">
                            Sloped edge weights</label>
                        <input type="checkbox" id="slopedEdgeWeight"
                            name="slopedEdgeWeight" />
                    </div>

                    <div>
                        <label htmlFor="edgeWidth">Edge width (pts)</label>
                        <input type="text" id="edgeWidth" name="edgeWidth"
                            defaultValue="0.4" />
                    </div>
                </div>

                <div>
                    <h3>Other</h3>
                    <div>
                        <label>Text format
                            <input type="radio" id="math" value="MATH"
                                name="textFormat" defaultChecked />
                            <label htmlFor="math">Math</label>

                            <input type="radio" id="text" value="TEXT"
                                name="textFormat" />
                            <label htmlFor="text">Text</label>
                        </label>
                    </div>
                </div>

                <div>
                    <button type="submit">Export</button>
                </div>
            </form>

            { exportText !== "" &&
                <div>
                    <textarea readOnly value={exportText}></textarea>
                    <button onClick={handleCopy}>Copy to clipboard</button>
                </div>
            }
        </div>
    );
}

export default ImportExportMenu;