import "../../style/EditMenu.css";
import { useState } from "react";
import type { Edge } from "../../types/Graph";


interface EditEdgeMenuProps {
    edge: Edge,
    onSubmit: (weight: string, color: string) => void
}

function EditEdgeMenu({ edge, onSubmit }: EditEdgeMenuProps) {
    const [weight, setWeight] = useState<string>(edge.weight);
    const [color, setColor] = useState<string>(edge.color);

    return (
        <div className="editMenu">
            <input type="color" />
            <input />
        </div>
    );
}

export default EditEdgeMenu;