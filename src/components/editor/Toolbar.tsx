import { useState } from "react";
import type { Mode } from "../../types/Menu";


interface ToolbarProps {
    onChange: (mode: Mode) => void
}


function Toolbar({ onChange }: ToolbarProps) {
    const [selected, setSelected] = useState<Mode>("select")

    function updateSelection(selection: Mode) {
        setSelected(selection);
        onChange(selection);
    }

    const options: Mode[] = ["select", "draw", "erase", "edit"];
    const radioButtons = options.map(opt =>
        <div key={opt}>
            <input type="radio" id={opt} name="mode" 
                value={opt} checked={selected === opt}
                onChange={_ => updateSelection(opt)}
            />
            <label htmlFor={opt}>{opt.toUpperCase()}</label>
        </div>
    )

    return (
        <div className="toolbar">
            {radioButtons}
        </div>
    )
}

export default Toolbar;
