# FileBrowser
A Online File Browser By Node.js



### install
```bash
git clone https://github.com/develon2015/FileBrowser.git
yarn install
yarn link
```



# usage
```bash
fs
fs 80
fs 0.0.0.0 80
```


### 使用`Cloudflare Workers`建立API

```JavaScript
/**
 * 获取客户端IP地址
 */

/** getClientIP() */
const getClientIP = request => request.headers.get("CF-Connecting-IP");

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  return new Response(getClientIP(request), {status: 200});
}
```
