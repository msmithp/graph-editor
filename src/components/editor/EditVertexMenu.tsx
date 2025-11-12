import "../../style/EditMenu.css";
import type { Vertex } from "../../types/Graph";
import { COLOR_PICKER_DEBOUNCE } from "../../utils/constants";
import { debounce } from "../../utils/utils";


interface EditVertexMenuProps {
    vertex: Vertex,
    onChangeLabel: (label: string) => void,
    onChangeColor: (color: string) => void
}

function EditVertexMenu({ vertex, onChangeLabel, 
    onChangeColor }: EditVertexMenuProps) {

    const debouncedChangeColor = debounce(onChangeColor, 
        COLOR_PICKER_DEBOUNCE);

    return (
        <div className="editMenu">
            <input type="color"
                id="editMenuColor"
                value={vertex.color}
                onChange={(e) => {
                    const newColor = e.currentTarget.value;
                    debouncedChangeColor(newColor);
                }}
            />
            <input
                id="editMenuName"
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