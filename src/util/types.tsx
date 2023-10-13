export type station = {
    id: string,
    mission: string,
    lat: number,
    long: number,
    startYear: number,
    startMonth: number,
    startDay: number,
    endYear: number,
    endMonth: number,
    endDay: number
}
export type sm = {
    type: string,
    id: string,
    date: number,
    year: number,
    month: number,
    day: number,
    h: number,
    m: number,
    s: number,
    lat: number,
    long: number,
    mag: number
}
export type ai = {
    type: string,
    id: string,
    year: number,
    month: number,
    day: number,
    h: number,
    m: number,
    s: number,
    lat: number,
    long: number,
    mag: string
}
export type dm = {
    type: string,
    id: string,
    date: number,
    year: number,
    month: number,
    day: number,
    h: number,
    m: number,
    s: number,
    lat: number,
    long: number,
    depth: number
}

export type info_attribute = {
    tag: string,
    value: string | undefined
}