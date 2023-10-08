import { SphereGeometry } from "three/src/Three.js";

export const SphereToQuads = (g: SphereGeometry) => {
    const p = g.parameters;
    const segmentsX = p.widthSegments;
    const segmentsY = p.heightSegments - 2;
    const mainShift = segmentsX + 1;
    const indices = [];
    for (let i = 0; i < segmentsY + 1; i++) {
        let index11 = 0;
        let index12 = 0;
        for (let j = 0; j < segmentsX; j++) {
            index11 = (segmentsX + 1) * i + j;
            index12 = index11 + 1;
            const index21 = index11;
            const index22 = index11 + (segmentsX + 1);
            indices.push(index11 + mainShift, index12 + mainShift);
            if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) {
                indices.push(index21 + mainShift, index22 + mainShift);
            }
        }
        if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) {
            indices.push(index12 + mainShift, index12 + segmentsX + 1 + mainShift);
        }
    }

    const lastIdx = indices[indices.length - 1] + 2;

    // poles
    for (let i = 0; i < segmentsX; i++) {
        //top
        indices.push(i, i + mainShift, i, i + mainShift + 1);

        // bottom
        const idx = lastIdx + i;
        const backShift = mainShift + 1;
        indices.push(idx, idx - backShift, idx, idx - backShift + 1);
    }

    g.setIndex(indices);
}