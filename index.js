#!/usr/bin/env node

/* modules */
const express = require("express")
const fs = require("fs")
const path = require("path")
const child_process = require("child_process")

/* logic */
const app = express()

// read config file
const config = require("./config.json")
if (process.env.PORT != null && process.env.PORT != '') config.port = process.env.PORT
console.log(config)

// router
app.get(['/', '/index', '/index.html?'], (req, res) => { res.sendFile(`${__dirname}/www/ls.html`) })

app.all('/ls', (req, res, next) => {
	let query = req._parsedUrl.query
	// URI解码，并处理.和..目录，同时限定根目录
	query = path.normalize('/' + decodeURI(query))
	console.log('query	-> ' + query)
	// let dir = `${process.env.PWD}${query}`
	let dir = `./${query}`

	let all = fs.readdirSync(dir, { withFileTypes: true })
	let dirs = []
	let files = []

	all.forEach(it => { (it.isDirectory() ? dirs : files).push(it.name) })

	res.json({ pwd: query, dirs: dirs, files: files })
})

// const expressNativeStaticHandler = express.static(`${process.env.PWD}`)
const expressNativeStaticHandler = express.static(`.`)
app.use((req, res, next) => {
	console.log('file	-> ' + req.url)
	const nextWrapper = () => {
		console.log('404 for ' + req.url)
		next()
	}
	expressNativeStaticHandler(req, res, nextWrapper)
})

/* 404 handler */
app.use((req, res) => { res.status(404).json({ error: 404 }) })

// listen service
app.listen(config.port, config.host, () => {
	try {
		console.log(`Visit URL http://${child_process.execSync(`curl 2>/dev/null cip.cc | awk '$0 ~ "IP.*" { print $3; }'`).toString().trim()}:${config.port}`);
	} catch(error) {
		console.log(error);
	}
});
