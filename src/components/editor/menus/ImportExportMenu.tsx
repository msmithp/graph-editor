interface ImportExportMenuProps {
    onExportTikz: () => void,
    onExportJson: () => void,
    onImportJson: () => void
}

function ImportExportMenu({ onExportTikz, onExportJson, 
    onImportJson }: ImportExportMenuProps) {
    return (
        <div className="menuTab">
            <div>
                <button onClick={onExportJson}>
                    Download JSON
                </button>
                <button onClick={onImportJson}>
                    Import JSON
                </button>
            </div>
            <div>
                <button onClick={onExportTikz}>
                    Export to TikZ
                </button>
            </div>
        </div>
    );
}

export default ImportExportMenu;