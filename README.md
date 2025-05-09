# Dynamica Proxy

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Dynamica** is a simple, fully working multi-protocol proxy written in Node.js.  
It supports **HTTP**, **HTTPS**, and **SOCKS5** traffic and is designed as part of the **Dynamica Project**.

---

## Features

- ✅ HTTP, HTTPS & SOCKS5 support  
- ✅ Zero configuration out of the box  
- ✅ Basic logging of all requests  
- ✅ 100% working, minimal setup required  
- ❌ No authentication (by design)

---

## Installation

```
git clone https://github.com/dynamica-proxy/dynamica-nodejs.git
cd dynamica-nodejs
npm install
````

You can optionally edit the `.env` file to configure ports.

---

## Usage

```
# On Linux/macOS:
sudo node .

# On Windows (with admin privileges):
node .
```

Once started, configure your system to use the proxy on the specified ports.

---

## Default Ports

| Protocol | Port |
| -------- | ---- |
| HTTP     | 443  |
| HTTPS    | 443  |
| SOCKS5   | 1080 |

These can be customized via `.env`.

---

## Example `.env`

```
PORT=443
SOCKS_PORT=80
```

---

## Logging

All connections and requests are logged to the console.
There is no file logging or rotation included by default.

---

## License

This project is licensed under the MIT License.
