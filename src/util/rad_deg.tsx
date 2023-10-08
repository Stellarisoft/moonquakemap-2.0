/* eslint-disable react-refresh/only-export-components */
const PI = 3.14159265359;

export const deg_to_rad = (deg: number) => {
    return deg * PI / 180
}

export const rad_to_deg = (rad: number) => {
    return rad * 180 / PI
}