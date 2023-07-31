#!/usr/bin/env node

import flags from './flags.json' assert { type: 'json' }
import cities from './cities.json' assert { type: 'json' }

function co(f) { return parseFloat(f).toFixed(4) }

let stat = cities.reduce( (acc, cur) => {
    acc[cur.name] = (acc[cur.name] || 0) + 1
    return acc
}, {})

console.log("export default")
console.log(JSON.stringify(cities.map( city => {
    let flag = flags[city.country_code]; if (!flag) throw new Error('no flag')
    return [
        [flag, `${city.name};`,
         stat[city.name] > 1 ? `${city.state_name}, ${city.country_name}` : city.country_name].join` `,
        { lat: co(city.latitude), lon: co(city.longitude) }
    ]
}), null, 2))
