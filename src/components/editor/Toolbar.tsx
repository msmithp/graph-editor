import { useState } from "react";
import type { Mode } from "../../types/Menu";
import { MODES } from "../../types/Menu";


interface ToolbarProps {
    vertexColor: string,
    onChangeMode: (mode: Mode) => void,
    onChangeColor: (color: string) => void
}


function Toolbar({ vertexColor, onChangeMode, onChangeColor }: ToolbarProps) {
    // State variables
    const [selected, setSelected] = useState<Mode>("MOVE");

    function updateSelection(selection: Mode) {
        setSelected(selection);
        onChangeMode(selection);
    }

    // Create buttons for each possible input mode
    const radioButtons = MODES.map(opt =>
        <div key={opt}>
            <input type="radio" id={opt} name="mode" 
                value={opt} checked={selected === opt}
                onChange={() => updateSelection(opt)}
            />
            <label htmlFor={opt}>{opt}</label>
        </div>
    )

    return (
        <div className="toolbar">
            <div className="toolbarOptions">
                {radioButtons}
            </div>
            <div className="toolbarColors" style={{display: "flex", flexDirection: "column"}}>
                <input type="color"
                    value={vertexColor}
                    onChange={e => onChangeColor(e.currentTarget.value)}
                />
            </div>
        </div>
    )
}

export default Toolbar;
