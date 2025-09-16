import type { GraphJSON } from "../../../types/IO";

interface ImportExportMenuProps {
    onExportTikz: () => void,
    onExportJson: () => void,
    onImportJson: (json: GraphJSON | null) => void
}

function ImportExportMenu({ onExportTikz, onExportJson, 
    onImportJson }: ImportExportMenuProps) {
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
                <button onClick={onExportTikz}>
                    Export to TikZ
                </button>
            </div>
        </div>
    );
}

export default ImportExportMenu;