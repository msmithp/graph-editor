import "../../style/EditMenu.css";
import type { Edge } from "../../types/Graph";
import { COLOR_PICKER_DEBOUNCE } from "../../utils/constants";
import { debounce } from "../../utils/utils";


interface EditEdgeMenuProps {
    edge: Edge,
    onChangeWeight: (weight: string) => void,
    onChangeColor: (color: string) => void
}

function EditEdgeMenu({ edge, onChangeWeight,
    onChangeColor }: EditEdgeMenuProps) {

    const debouncedChangeColor = debounce(onChangeColor, 
        COLOR_PICKER_DEBOUNCE);

    return (
        <div className="editMenu">
            <input type="color"
                id="editMenuColor"
                value={edge.color}
                onChange={(e) => {
                    const newColor = e.currentTarget.value;
                    debouncedChangeColor(newColor);
                }}
            />
            <input
                id="editMenuName"
                value={edge.weight}
                onChange={(e) => {
                    const newWeight = e.currentTarget.value;
                    onChangeWeight(newWeight);
                }}
            />
        </div>
    );
}

export default EditEdgeMenu;