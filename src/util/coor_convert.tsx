import { deg_to_rad } from "./rad_deg"

export const get_x = (r: number, lat: number, long: number) => {
    return r * Math.sin(deg_to_rad(lat)) * Math.cos(deg_to_rad(long))
}

export const get_y = (r: number, lat: number, long: number) => {
    return r * Math.sin(deg_to_rad(lat)) * Math.sin(deg_to_rad(long))
}

export const get_z = (r: number, lat: number) => {
    return r * Math.cos(deg_to_rad(lat))
}