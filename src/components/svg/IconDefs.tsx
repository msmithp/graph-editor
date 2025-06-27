import { VERTEX_RADIUS } from "../../utils/constants";

// Arrow head dimensions
const ARROW_WIDTH = 15;
const ARROW_HEIGHT = 20;

function IconDefs() {
    return (
        <defs>
            {/* Arrow marker */}
            <marker
                markerUnits="userSpaceOnUse"
                id="arrow"
                markerWidth={ARROW_WIDTH}
                markerHeight={ARROW_HEIGHT}
                refX={VERTEX_RADIUS + ARROW_WIDTH}
                refY={ARROW_HEIGHT / 2}
                orient="auto"
            >
                <path
                    d={`M 0 0 
                        L ${ARROW_WIDTH} ${ARROW_HEIGHT / 2} 
                        L 0 ${ARROW_HEIGHT} z`}
                    fill="context-stroke"
                />
            </marker>
        </defs>
    );
}

export default IconDefs;