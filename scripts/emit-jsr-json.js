#!/usr/bin/env node
import { expectTruthy } from "@samual/assert"
import { mkdirSync as makeDirectorySync, writeFileSync } from "fs"
import packageJson from "../package.json" with { type: "json" }
import { getExports } from "./lib/exports.js"

if (!process.env.FULL_ERROR) {
	process.on(`uncaughtException`, error => {
		console.error(error.message)
		process.exit(1)
	})
}

/** @type {Record<string, string>} */ const ConvertToJsr = {
	"@samual/types": "@samual/types",
	"jsodd": "@sn/jsodd",
	"tiny-ulid": "@sn/ulid"
}

const name = expectTruthy(process.env.JSR_NAME, `Missing JSR_NAME`)
const exports = await getExports(`.d.ts`, `.js`)
const { version, license, dependencies } = packageJson

makeDirectorySync("dist", { recursive: true })

const imports = Object.fromEntries(Object.entries(dependencies).map(
	([ name, version ],) => [ name, `${name in ConvertToJsr ? `jsr:${ConvertToJsr[name]}` : `npm:${name}`}@${version}` ]
))

writeFileSync("dist/jsr.json", JSON.stringify({ name, version, license, exports, imports }, undefined, "\t"))
