#!/usr/bin/env node

/* modules */
const express = require("express")
const fs = require("fs")

/* logic */
const app = express()

// read config file
const config = require("./config.json")
if (process.env.PORT != null && process.env.PORT != '') config.port = process.env.PORT
console.log(config)

// router
app.get(['/', '/index', '/index.html?'], (req, res) => { res.sendFile(`${__dirname}/www/ls.html`) })

app.use(express.static(`${process.env.PWD}`))

app.all('/ls', (req, res, next) => {
	let query = req.url.replace(/[^\?]*\?/, '')
	query = decodeURI(query)
	let path = `${process.env.PWD}/${query}`
	console.log('query -> ' + path)

	let all = fs.readdirSync(path, { withFileTypes: true })
	let dirs = []
	let files = []

	all.forEach(it => { (it.isDirectory() ? dirs : files).push(it.name) })

	res.json({ pwd: query, dirs: dirs, files: files })
})

/* 404 handler */
app.use((req, res) => { res.status(404).json({ error: 404 }) })

// listen service
app.listen(config.port, config.host, () => { console.log(`Visit URL http://${config.host}:${config.port}`) })

