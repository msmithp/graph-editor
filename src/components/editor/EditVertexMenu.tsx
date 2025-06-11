import "../../style/EditMenu.css";
import type { Vertex } from "../../types/Graph";


interface EditVertexMenuProps {
    vertex: Vertex,
    onChangeLabel: (label: string) => void,
    onChangeColor: (color: string) => void
}

function EditVertexMenu({ vertex, onChangeLabel, 
    onChangeColor }: EditVertexMenuProps) {
    return (
        <div className="editMenu">
            <input type="color"
                value={vertex.color}
                onChange={(e) => {
                    const newColor = e.currentTarget.value;
                    onChangeColor(newColor);
                }}
            />
            <input
                value={vertex.label}
                onChange={(e) => {
                    const newLabel = e.currentTarget.value;
                    onChangeLabel(newLabel);
                }}
            />
        </div>
    );
}

export default EditVertexMenu;