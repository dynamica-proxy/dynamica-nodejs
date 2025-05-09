var socks = require('socksv5');
const net = require("net");
const app = net.createServer();
require('dotenv').config()

const PORT = process.env.PORT || 8080;
const SOCK = process.env.SOCKS_PORT || 1080;
app.setMaxListeners(100);
 
var srv = socks.createServer(function(info, accept, deny) {
  console.log(`SOCKS REQ: ${info}`)
  accept();
});
srv.listen(SOCK, '0.0.0.0', function() {
  console.log(`SOCKS server listening on port ${SOCK}`);
});
 
srv.useAuth(socks.auth.None());

/*
srv.useAuth(socks.auth.UserPassword(function(user, password, cb) {
    cb(user === 'nodejs' && password === 'rules!');
}));
*/

app.on("connection", (clientToProxySocket) => {
  console.log("Client connected to Proxy");

  clientToProxySocket.once("data", (data) => {
    const dataString = data.toString();
    console.log("Received data:", dataString.substring(0, 200) + (dataString.length > 200 ? "..." : ""));

    if (dataString.startsWith("GET")) {
      clientToProxySocket.write("HTTP/1.1 200 OK\\r\\nContent-Length: 0\\r\\nConnection: close\\r\\n\\r\\n");
      clientToProxySocket.end();
      return;
    }

    let isConnectionTLS = dataString.indexOf("CONNECT") !== -1;

    let serverPort = 80;
    let serverAddr;

    if (isConnectionTLS) {
      serverPort = 443;
      const connectLine = dataString.split("\n")[0]; // Haal de CONNECT regel eruit
      if (connectLine) {
        const parts = connectLine.split(" ");
        if (parts.length > 1) {
          serverAddr = parts[1].split(":")[0];
          if (parts[1].includes(":")) {
            serverPort = parseInt(parts[1].split(":")[1], 10);
          }
        }
      }
    } else {
      const hostLine = dataString.split("\n").find(line => line.startsWith("Host: "));
      if (hostLine) {
        serverAddr = hostLine.split("Host: ")[1].trim();
      } else {
        console.log("Host header not found in non-TLS request");
        clientToProxySocket.end(); // Sluit de verbinding als de Host header ontbreekt
        return;
      }
    }

    if (!serverAddr) {
      console.log("Could not determine server address");
      clientToProxySocket.end();
      return;
    }

    let proxyToServerSocket = net.createConnection(
      {
        host: serverAddr,
        port: serverPort,
      },
      () => {
        console.log("Proxy connected to server:", serverAddr, ":", serverPort);
        if (isConnectionTLS) {
          clientToProxySocket.write("HTTP/1.1 200 OK\\r\\n\\r\\n");
        } else {
          proxyToServerSocket.write(data);
        }
        clientToProxySocket.pipe(proxyToServerSocket);
        proxyToServerSocket.pipe(clientToProxySocket);
      }
    );

    proxyToServerSocket.on("error", (err) => {
      console.log("Proxy to server error:", err);
      clientToProxySocket.end();
    });

    clientToProxySocket.on("error", (err) => {
      console.log("Client to proxy error:", err);
      proxyToServerSocket.end();
    });

    app.on("close", () => {
      console.log("Connection closed");
    });
  });
});

app.on("close", () => {
  console.log("Connection closed");
});

app.listen({ host: "0.0.0.0", port: PORT }, () => {
  console.log("Server running on PORT:", PORT);
})