#!/usr/bin/env node
process.title = "HTTP Server";

/* modules */
const express = require("express")
const fs = require("fs")
const path = require("path")
const child_process = require("child_process")
const os = require('os');

/* library */
const node = require('@develon/js/lib/node');

/* logic */
const app = express()

// read config file
const config = require("./config.json")
if (process.env.PORT != null && process.env.PORT != '') config.port = process.env.PORT
// console.log(config)

if (process.argv.length > 2) { // 从命令行参数提供监听地址
	let pa = process.argv[2];
	let pb = process.argv[3];
	if (pa && pa.match(/^\d+$/)) {
		config.port = pa;
	} else {
		config.host = pa;
		if (pb && pb.match(/^\d+$/)) {
			config.port = pb;
		}
	}
}

// 跨域OK
app.use((req, res, next) => {
	res.set({
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "*",
		"Access-Control-Allow-Headers": "*",
	});
	next();
});
app.options('*', (req, res) => {
	res.end();
});

// router
// app.get(['/', '/index', '/index.html?'], (req, res) => { res.sendFile(`${__dirname}/www/ls.html`) })
app.get(['/', '/index'], (req, res) => { res.sendFile(`${__dirname}/www/ls.html`) }); // 直接展示index.html

app.all('/ls', (req, res, next) => {
	let query = req._parsedUrl.query
	// URI解码，并处理.和..目录，同时限定根目录
	query = path.posix.normalize('/' + decodeURI(query))
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
	// console.log(`Visit URL http://${child_process.execSync(`curl 2>/dev/null cip.cc | awk '$0 ~ "IP.*" { print $3; }'`).toString().trim()}:${config.port}`);
	(async () => {
		let ip = await getPublicIP();
		console.log(`Visit URL(public) http://${ip}:${config.port}`);
	})().catch(error => void console.log('获取公有IP地址失败'));
	console.log('服务器已启动');
	node.network.ip().ipv4.forEach(it => {
		console.log(`Visit URL(locale) http://${it}:${config.port}`);
	});
	if (os.platform().match(/win/)) {
		try {
			console.log('启动浏览器');
			child_process.exec(`start http://127.0.0.1${config.port === 80 ? '' : `:${config.port}`}`);
		} catch (error) {
			console.log(error);
		}
	}
});
// listen program running failed exception
process.addListener('uncaughtException', (error, /**监听事件名*/name) => {
	if (error.syscall === 'listen') {
		console.log('TCP服务监听失败！');
		if (error.code === 'EADDRINUSE') {
			console.log('端口被占用！');
		}
	}
	console.log('未处理的异常！');
	console.error(error);
});

/** fetch public IP address */
function getPublicIP() {
	return new Promise((resolve, reject) => {
		try {
			let child = child_process.exec(`curl "http://ip.my-api.workers.dev"`, {}, (error, stdout, stderr) => {
				if (!!!error) {
					resolve(stdout);
				}
			});
		} catch(error) {
			reject();
		}
	});
}