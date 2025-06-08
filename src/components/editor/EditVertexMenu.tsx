import "../../style/EditMenu.css";
import { useState } from "react";
import type { Vertex } from "../../types/Graph";


interface EditVertexMenuProps {
    vertex: Vertex,
    onSubmit: (label: string, color: string) => void
}

function EditVertexMenu({ vertex, onSubmit }: EditVertexMenuProps) {
    const [label, setLabel] = useState<string>(vertex.label);
    const [color, setColor] = useState<string>(vertex.color);

    return (
        <div className="editMenu">
            <input type="color"
                value={color}
                onChange={(e) => {
                    const newColor = e.currentTarget.value;
                    setColor(newColor);
                    onSubmit(label, newColor);
                }}
            />
            <input
                value={label}
                onChange={(e) => {
                    const newLabel = e.currentTarget.value;
                    setLabel(newLabel);
                    onSubmit(newLabel, color);
                }}
            />
        </div>
    );
}

export default EditVertexMenu;