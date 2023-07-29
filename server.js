import http from 'http'
import fs from 'fs'
import path from 'path'
import locations from './locations/Locations.js'

function cities(res, q) {
    let r = []
    q = (q || '').trim().toLowerCase(); if (q) {
        r = locations.filter( v => v[0].toLowerCase().includes(q))
            .slice(0, 10).map( v => v[0])
        expires_in(res, 60)
    }
    res.end(JSON.stringify(r))
}

function weather(res, location) {
    let coords = locations.find( v => v[0] === location)?.[1]
    if (!coords) {
        err(res, 'invalid location')
        return
    }
    res.end(JSON.stringify(coords))
}

let server = http.createServer( (req, res) => {
    if (req.method !== 'GET') { usage(res); return }

    let url; try {
        url = new URL(req.url, `http://${req.headers.host}`)
    } catch (_) {
        usage(res)
        return
    }

    let city = url.searchParams.get('city')
    let location = url.searchParams.get('l')

    if (city != null) {
        cities(res, city)
    } else if (location != null) {
        weather(res, location)
    } else if (req.url === '/stat') {
        res.end(locations.length.toString())
    } else
        serve_static(req, res, req.url)
})

if (import.meta.url.endsWith(process.argv[1]))
    server.listen(process.env.PORT || 8080)

function err(res, msg) {
    res.statusCode = 400
    res.statusMessage = msg
    res.end()
}

function usage(res) { err(res, 'usage: ?city=query ?l=location or /stat') }

function expires_in(res, sec) {
    res.setHeader("Expires", new Date(Date.now() + sec*1000).toUTCString())
}

let public_root = fs.realpathSync(path.dirname(process.argv[1]))

function serve_static(req, res, file) {
    if (/^\/+$/.test(file)) file = "index.html"
    let name = path.join(public_root, path.normalize(file))
    fs.stat(name, (err, stats) => {
        if (err) {
            res.statusCode = 404
            res.end()
            return
        }
        res.setHeader('Content-Length', stats.size)
        res.setHeader('Content-Type', {
            '.html': 'text/html',
            '.gif': 'image/gif',
            '.js': 'application/javascript'
        }[path.extname(name)] || 'application/octet-stream')
        expires_in(res, 60*60)

        let stream = fs.createReadStream(name)
        stream.on('error', err => {
            res.statusCode = 500
            console.error(err.message)
            res.end()
        })
        stream.pipe(res)
    })
}
