const net = require('net');

// Test connectivity to Gmail SMTP on both ports
const ports = [465, 587];

for (const port of ports) {
  const s = net.createConnection({ host: 'smtp.gmail.com', port, timeout: 5000 });
  s.on('connect', () => {
    console.log(`✅ Connected to smtp.gmail.com:${port}`);
    s.destroy();
  });
  s.on('timeout', () => {
    console.log(`❌ TIMEOUT: Cannot connect to smtp.gmail.com:${port}`);
    s.destroy();
  });
  s.on('error', (e) => {
    console.log(`❌ ERROR on port ${port}: ${e.message}`);
    s.destroy();
  });
}
