#!/usr/bin/env node

/* modules */
const express = require("express")
const fs = require("fs")
const path = require("path")

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
	let dir = `${process.env.PWD}${query}`

	let all = fs.readdirSync(dir, { withFileTypes: true })
	let dirs = []
	let files = []

	all.forEach(it => { (it.isDirectory() ? dirs : files).push(it.name) })

	res.json({ pwd: query, dirs: dirs, files: files })
})

const expressNativeStaticHandler = express.static(`${process.env.PWD}`)
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
app.listen(config.port, config.host, () => { console.log(`Visit URL http://${config.host}:${config.port}`) })

