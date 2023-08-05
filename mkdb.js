#!/usr/bin/env node

import fs from 'fs'
import Database from 'better-sqlite3';

let cities = JSON.parse(fs.readFileSync('/dev/stdin'))

function co(f) { return parseFloat(f).toFixed(4) }

let stat = cities.reduce( (acc, cur) => {
    acc[cur.name] = (acc[cur.name] || 0) + 1
    return acc
}, {})

let db = new Database('_out/locations.sqlite3')
db.pragma('journal_mode = WAL')
db.prepare('CREATE VIRTUAL TABLE locations USING fts5(pretty, country, lat UNINDEXED, lon UNINDEXED)').run()
let st = db.prepare('INSERT INTO locations(pretty, country, lat, lon) VALUES(?,?,?,?)')

cities.filter( v => !(v.country_code === 'RU' || v.country_code === 'BY')).forEach( v => {
    st.run([v.name, stat[v.name]>1 ? `${v.state_name}; ${v.country_name}` : v.country_name].join`; `, v.country_code, co(v.latitude), co(v.longitude))
})

db.close()
