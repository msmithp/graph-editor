import { useState } from "react";
import { isInteger } from "../../../utils/utils";
import "../../../style/SettingsMenu.css";


interface SettingsMenuProps {
    onUpdateDirected: (isDirected: boolean) => void,
    onUpdateGridBase: (base: number | null) => void,
    onShowGrid: (isShown: boolean) => void
}

function SettingsMenu({ onUpdateDirected, 
    onUpdateGridBase, onShowGrid }: SettingsMenuProps) {
    const [isGridOn, setIsGridOn] = useState<boolean>(false);
    const [gridBase, setGridBase] = useState<string>("");
    const [isGridShown, setIsGridShown] = useState<boolean>(false);

    function updateGridShown(isChecked: boolean) {
        setIsGridShown(isChecked);
        onShowGrid(isChecked);
    }

    return (
        <div className="menuTab">
            <div>
                {/* "Directed edges" checkbox */}
                <input
                    type="checkbox"
                    id="directed"
                    onChange={(e) => onUpdateDirected(e.currentTarget.checked)}
                />
                <label htmlFor="directed">Directed edges</label>
            </div>

            <div>
                {/* "Snap to grid" checkbox */}
                <input 
                    type="checkbox"
                    id="grid"
                    onChange={(e) => {
                        setIsGridOn(e.currentTarget.checked);                        
                        onUpdateGridBase(null);
                        setGridBase("");
                        updateGridShown(false);
                    }}
                />
                <label htmlFor="grid">Snap vertices to grid</label>
            </div>

            <div>
                <form>
                    <input
                        id="gridBase"
                        disabled={!isGridOn}
                        value={gridBase}
                        onChange={(e) => 
                            setGridBase(e.currentTarget.value)
                        }
                    />
                    <button
                        disabled={!isGridOn}
                        onClick={(e) => {
                            e.preventDefault();
                            if (gridBase === "") {
                                onUpdateGridBase(null);
                            } else if (isInteger(gridBase)) {
                                const newBase = Number(gridBase);
                                onUpdateGridBase(newBase);
                            }
                        }}
                    >
                        Update graph
                    </button>
                </form>

                <input
                    disabled={!isGridOn}
                    type="checkbox"
                    id="showGrid"
                    checked={isGridShown}
                    onChange={(e) => updateGridShown(e.currentTarget.checked)}
                />
                <label htmlFor="showGrid">Show grid lines</label>
            </div>
        </div>
    );
}

export default SettingsMenu;