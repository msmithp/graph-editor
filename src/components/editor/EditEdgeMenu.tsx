import "../../style/EditMenu.css";
import type { Edge } from "../../types/Graph";


interface EditEdgeMenuProps {
    edge: Edge,
    onChangeWeight: (weight: string) => void,
    onChangeColor: (color: string) => void
}

function EditEdgeMenu({ edge, onChangeWeight,
    onChangeColor }: EditEdgeMenuProps) {
    return (
        <div className="editMenu">
            <input type="color" 
                value={edge.color}
                onChange={(e) => {
                    const newColor = e.currentTarget.value;
                    onChangeColor(newColor);
                }}
            />
            <input 
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