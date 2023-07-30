import http from 'http'
import fs from 'fs'
import path from 'path'
import locations from './locations/Locations.js'

function cities(res, q) {
    let r = []
    q = (q || '').trim().toLowerCase(); if (q) {
        r = locations.filter( v => v[0].toLowerCase().includes(q))
            .slice(0, 10).map( v => v[0])
        res.setHeader("Expires", new Date(Date.now() + 300*1000).toUTCString())
    }
    res.end(JSON.stringify(r))
}

function weather(res, location) {
    let co = locations.find( v => v[0] === location)?.[1]
    if (!co) return err(res, 'invalid location')

    fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${co.lat}&lon=${co.lon}`).then( async v => {
        if (!v.ok) throw new Error(v.statusText)
        return { expires: v.headers.get('expires'), json: await v.json() }
    }).then( v => {
        let r = v.json?.properties?.timeseries?.[0]
        if (v.expires) res.setHeader("Expires", v.expires)
        res.end(JSON.stringify({
            time: r?.time,
            details: r?.data?.instant?.details,
            co
        }))
    }).catch( e => err(res, `MET Norway: ${e.message}`, 500))
}

let server = http.createServer( (req, res) => {
    let url; try {
        url = new URL(req.url, `http://${req.headers.host}`)
    } catch (_) {
        return usage(res)
    }

    if (req.method === 'GET' && url.pathname === '/api') {
        let city = url.searchParams.get('city')
        let location = url.searchParams.get('l')

        if (city != null) {
            cities(res, city)
        } else if (location != null) {
            weather(res, location)
        } else
            usage(res)
    } else
        serve_static(res, url.pathname)
})

if (import.meta.url.endsWith(process.argv[1]))
    server.listen(process.env.PORT || 8080)

function err(res, msg, code = 400) {
    res.statusCode = code
    res.statusMessage = msg
    res.end()
}

function usage(res) { err(res, 'Usage: /api?city=query /api?l=location') }

let public_root = fs.realpathSync(path.dirname(process.argv[1]))

function serve_static(res, file) {
    if (/^\/+$/.test(file)) file = "index.html"
    let name = path.join(public_root, path.normalize(file))
    fs.stat(name, (err, stats) => {
        if (err) {
            res.statusCode = 404
            return res.end()
        }
        res.setHeader('Content-Length', stats.size)
        res.setHeader('Content-Type', {
            '.html': 'text/html',
            '.js': 'application/javascript'
        }[path.extname(name)] || 'application/octet-stream')

        let stream = fs.createReadStream(name)
        stream.on('error', err => {
            res.statusCode = 500
            console.error(err.message)
            res.end()
        })
        stream.pipe(res)
    })
}
