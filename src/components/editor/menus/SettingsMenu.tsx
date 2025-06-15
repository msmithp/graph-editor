import { useState } from "react";
import { isInteger } from "../../../utils/utils";


interface SettingsMenuProps {
    onUpdateDirected: (isDirected: boolean) => void,
    onUpdateGridBase: (base: number | null) => void,
    onShowGrid: (isShown: boolean) => void
}

function SettingsMenu({ onUpdateDirected, 
    onUpdateGridBase, onShowGrid }: SettingsMenuProps) {
    const [isGridOn, setIsGridOn] = useState<boolean>(false);
    const [gridBase, setGridBase] = useState<string>("");

    return (
        <div>
            <div>
                <input
                    type="checkbox"
                    id="directed"
                    onChange={(e) => onUpdateDirected(e.currentTarget.checked)}
                />
                <label htmlFor="directed">Directed edges</label>
            </div>

            <div>
                <input 
                    type="checkbox"
                    id="grid"
                    onChange={(e) => {
                        setIsGridOn(e.currentTarget.checked);
                        onUpdateGridBase(null);
                        onShowGrid(false);
                    }}
                />
                <label htmlFor="grid">Snap to grid</label>
            </div>

            { isGridOn && 
                <div>
                    <form>
                        <input
                            disabled={!isGridOn}
                            value={gridBase}
                            onChange={(e) => setGridBase(e.currentTarget.value)}
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
                        type="checkbox"
                        id="showGrid"
                        onChange={(e) => onShowGrid(e.currentTarget.checked)}
                    />
                    <label htmlFor="showGrid">Show grid lines</label>
                </div>
            }
        </div>
    );
}

export default SettingsMenu;