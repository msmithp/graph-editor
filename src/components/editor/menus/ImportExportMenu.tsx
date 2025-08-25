interface ImportExportMenuProps {
    onExportTikz: () => void;
}

function ImportExportMenu({ onExportTikz }: ImportExportMenuProps) {
    return (
        <div className="menuTab">
            <button onClick={onExportTikz}>
                Export to TikZ
            </button>
        </div>
    );
}

export default ImportExportMenu;