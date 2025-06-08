import { useState } from "react";
import type { Mode } from "../../types/Menu";
import { MODES } from "../../types/Menu";


interface ToolbarProps {
    onChange: (mode: Mode) => void
}


function Toolbar({ onChange }: ToolbarProps) {
    // State variables
    const [selected, setSelected] = useState<Mode>("MOVE")

    function updateSelection(selection: Mode) {
        setSelected(selection);
        onChange(selection);
    }

    // Create buttons for each possible input mode
    const radioButtons = MODES.map(opt =>
        <div key={opt}>
            <input type="radio" id={opt} name="mode" 
                value={opt} checked={selected === opt}
                onChange={_ => updateSelection(opt)}
            />
            <label htmlFor={opt}>{opt}</label>
        </div>
    )

    return (
        <div className="toolbar">
            {radioButtons}
        </div>
    )
}

export default Toolbar;
