#!/usr/bin/env node

import fs from 'fs'

let cities = JSON.parse(fs.readFileSync(process.argv[2]))
let flags = JSON.parse(fs.readFileSync(process.argv[3]))

function co(f) { return parseFloat(f).toFixed(4) }

let stat = cities.reduce( (acc, cur) => {
    acc[cur.name] = (acc[cur.name] || 0) + 1
    return acc
}, {})

console.log("export default")
console.log(JSON.stringify(cities.filter( v => v.country_code !== 'RU')
                           .map( city => {
    let flag = flags[city.country_code]; if (!flag) throw new Error('no flag')
    return [
        [flag, `${city.name};`,
         stat[city.name] > 1 ? `${city.state_name}, ${city.country_name}` : city.country_name].join` `,
        { lat: co(city.latitude), lon: co(city.longitude) }
    ]
}), null, 2))
