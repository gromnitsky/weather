#!/usr/bin/env node

import fs from 'fs'

let cities = JSON.parse(fs.readFileSync(process.argv[2]))
let flags = JSON.parse(fs.readFileSync(process.argv[3]))

function co(f) { return parseFloat(f).toFixed(4) }

let stat = cities.reduce( (acc, cur) => {
    acc[cur.name] = (acc[cur.name] || 0) + 1
    return acc
}, {})

cities.filter( v => v.country_code !== 'RU').forEach( v => {
    console.log([
        [
            `${flags[v.country_code]} ${v.name}`,
            stat[v.name] > 1 ? `${v.state_name}; ${v.country_name}` : v.country_name,
        ].join`; `,
        co(v.latitude),
        co(v.longitude),
    ].join`|`)
})
