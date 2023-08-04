An attempt to write a minimal, but usable weather app under 200 LOC.

For the description of how it works, see this
[blog post](https://sigwait.org/~alex/blog/2023/07/30/a-minimalistic-weather-app.html).

If you want to run it yourself:

~~~
$ sudo dnf install icu  # icu-devtools in Debian
$ make                  # generate location data
$ npm i
$ PORT=1234 node server.js _out/web
~~~

## Loicense

MIT.
