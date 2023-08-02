#!/usr/bin/env node

import fs from 'fs'

let flags = JSON.parse(fs.readFileSync(new URL('flags.json', import.meta.url)))
let cities = JSON.parse(fs.readFileSync('/dev/stdin'))

function co(f) { return parseFloat(f).toFixed(4) }

let stat = cities.reduce( (acc, cur) => {
    acc[cur.name] = (acc[cur.name] || 0) + 1
    return acc
}, {})

cities.filter( v => !(v.country_code === 'RU' || v.country_code === 'BY')).forEach( v => {
    console.log([
        [
            `${flags[v.country_code]} ${v.name}`,
            stat[v.name] > 1 ? `${v.state_name}; ${v.country_name}` : v.country_name,
        ].join`; `,
        co(v.latitude),
        co(v.longitude),
    ].join`|`)
})
