function cities(query) {
    return fetch('/api?city='+query).then( v => {
        if (!v.ok) throw new Error(v.statusText)
        return v.json()
    })
}

function weather(location) {
    return fetch('/api?l='+location).then( v => {
        if (!v.ok) throw new Error(v.statusText)
        return v.json()
    })
}

function debounce(fn, ms = 0) {
    let tid
    return function(...args) {
        clearTimeout(tid)
        tid = setTimeout(() => fn.apply(this, args), ms)
    }
}

async function completion(query) {
    return (await cities(query)).map( v => {
        return `<option value="${v}">` // FIXME
    }).join`\n`
}

function err(ctx, error) {
    let event = new Event('my-error')
    event.error = error
    ctx.dispatchEvent(event)
}

let city = document.querySelector("#form input")
let datalist = document.querySelector("#form datalist")
let result = document.querySelector("#result")

city.addEventListener("input", debounce(async function(evt) {
    log(evt.inputType)
    if (evt.inputType === "insertReplacementText") { // firefox
        this.dispatchEvent(new Event('change'))
        datalist.innerHTML = ''
        return
    } else if (!evt.inputType?.match(/^(insertText|delete|insertFromPaste)/)) {
        datalist.innerHTML = ''
        return
    }

    try {
        datalist.innerHTML = await completion(this.value)
    } catch (e) {
        err(this, e)
    }
}, 250))

let prev_change_value
city.addEventListener("change", function() {
    if (prev_change_value === this.value) return
    prev_change_value = this.value
    log("CHANGE")

    result.innerText = "Loading..."
    this.disabled = true
    weather(this.value).then( v => {
        let r = [`<table><tr><td>Latest Update</td><td>${v.time}<td></tr>`]
        v = v.details
        r.push(`<tr><td>T, °C</td><td>${v.air_temperature}</td></tr>`)
        r.push(`<tr><td>Humidity, %</td><td>${v.relative_humidity}</td></tr>`)
        r.push(`<tr><td>Wind Speed, m/s</td><td>${v.wind_speed}</td></tr>`)
        r.push(`<tr><td>Wind, °</td><td>${v.wind_from_direction}</td></tr>`)
        r.push(`<tr><td>Clouds, %</td><td>${v.cloud_area_fraction}</td></tr>`)
        r.push(`<tr><td>Sea Level Air Pressure, hPa</td><td>${v.air_pressure_at_sea_level}</td></tr>`)
        r.push('</table>')
        result.innerHTML = r.join`\n`

        let params = (new URL(location.href)).searchParams
        params.set('l', this.value)
        history.replaceState({}, '', '?'+params.toString())
    }).catch(e => {
        err(this, e)
    }).finally( () => this.disabled = false)
})

city.addEventListener("my-error", function(evt) {
    result.innerText = evt.error
    console.error(evt.error)
})

let params = (new URL(location.href)).searchParams
let log = params.get('debug') ? console.log : () => {}
let l = params.get('l')?.trim()
if (l) {
    city.value = l
    city.dispatchEvent(new Event('change'))
}
