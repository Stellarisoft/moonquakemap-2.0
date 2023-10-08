//Function coordinates
export const to_xyz = (r: number, lat_ori: number, lon_ori: number) => {
    // Transforms the angles given from the geographical coordinates to angles used in spherical coordinates.
    const lat = (90 - lat_ori) * Math.PI / 180;
    let lon = lon_ori - 90;
    if (lon < 0) {
        lon = (360 + lon) * Math.PI / 180;
    } else {
        lon = lon * Math.PI / 180;
    }

    // Transforms from spherical coordinates to rectangular coordiantes.
    const x = r * Math.sin(lat) * Math.cos(lon);
    let y = r * Math.sin(lat) * Math.sin(lon);
    let z = r * Math.cos(lat);

    const aux = y;
    y = z
    z = -aux

    // Returns an array with each cartesian coordinate.
    return [x, y, z];
}