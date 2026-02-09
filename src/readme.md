<%
const { FULL_ERROR, TARGET, JSR_NAME } = process.env

if (!FULL_ERROR) {
	process.on("uncaughtException", error => {
		console.error(error.message)
		process.exit(1)
	})
}

const { readFileSync } = await import("fs")
const { assert } = await import("@samual/assert")

assert(JSR_NAME, "Missing JSR_NAME")

const packageJson = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }))
const PackageName = TARGET == "jsr" ? JSR_NAME : packageJson.name
%>
# Logging Sucks
Requires Node.js 20.10+, 22.0+, 24.0+, or above.

Inspired by https://loggingsucks.com/.

## Example
```js
import { log, captureLogs, logItems } from "<%= PackageName %>/json-file"
import { writeFileSync } from "fs"

// Capture the time and any other important information given to the program
log(`start`, { date: new Date().toISOString(), args: process.argv })
// You can log whatever you want here as long its JSON-compatible, for example
// environment variables.

function doThing(someArg) {
	// Takes a name and an immediately invoked callback
	captureLogs(`doThings()`, ({ log }) => {
		// When looking through logs, it can be useful to know function args
		log({ someArg })
		// The `log()` function provided by `captureLogs()` doesn't need a name

		// ...
	})
}

// Write the log items to a JSON file
writeFileSync(`log.json`, JSON.stringify(logItems, undefined, "\t"))
// You can report the logs in any way you want, for example you could use
// `process.on("beforeExit")` and send an email
```

---
<% if (TARGET == "git") { %>
This package is available on [JSR][jsr] and [NPM][npm].
<% } else if (TARGET == "jsr") { %>
This package is also [available on NPM][npm].
<% } else if (TARGET == "npm") { %>
This package is also [available on JSR][jsr].
<% } else throw Error("Invalid or missing TARGET.") %>

[npm]: https://www.npmjs.com/package/<%= packageJson.name %>

[jsr]: https://jsr.io/<%= JSR_NAME %>
