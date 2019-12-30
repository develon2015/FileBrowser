#!/usr/bin/env node

/* modules */
const express = require('express')
const fs = require('fs')

/* global object */
const config = require(`${__dirname}/config.json`)
const app = express()

/* logic */
// GET / => sendFile ./www/ls.html
app.use((req, res, next) => {
	res.set({
		'Server': 'nginx',
		'X-Powered-By': 'Unknown'
	})
	next()
})

app.get('/', (req, res) => res.sendFile(`${__dirname}/www/ls.html`))

// GET /file => sendFile ./www/file
app.use('/', express.static(`${process.env.PWD}`))

// GET ls?pwd
app.get('/ls', (req, res) => {
	let pwd = req.url.replace('/ls?', '')
	console.log(`ls -> ${pwd}`)

	let all = fs.readdirSync(`${process.env.PWD}/${pwd}`, { withFileTypes: true })
	let dirs = []
	let files = []

	all.forEach(it => {
		if (it.isDirectory()) {
			dirs.push(it.name)
		} else {
			files.push(it.name)
		}
	})

	res.json({
		pwd: pwd,
		dirs: dirs,
		files: files
	})
})

// 404 => sendFile ./www/404.html
app.use((req, res) => res.sendFile(`${__dirname}/www/404.html`))

/* listen */
app.listen(config.port, config.host, () => console.log('server starting...'))

