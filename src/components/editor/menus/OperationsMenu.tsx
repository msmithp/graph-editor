interface OperationsMenuProps {
    onLineGraph: () => void,
    onComplement: () => void
}

function OperationsMenu({ onLineGraph, onComplement }: OperationsMenuProps) {
    return (
        <div className="menuTab">
            <button
                onClick={e => {
                    e.preventDefault();
                    onLineGraph();
                }}
            >
                To line graph
            </button>
            <button
                onClick={e => {
                    e.preventDefault();
                    onComplement();
                }}
            >
                To complement
            </button>
        </div>
    );
}

export default OperationsMenu;