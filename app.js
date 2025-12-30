/* ===============================
   DoS Tester – created by CyberTube
   Simulation Engine (ALL-IN-ONE)
   =============================== */

// ---- Config ----
const LIMITS = {
  MAX_PACKETS: 2000,
  RATE_LIMIT: 800
};

const PACKET_TYPES = [
  "TCP SYN",
  "UDP Flood",
  "HTTP GET",
  "HTTP POST",
  "ICMP Echo"
];

// ---- Helpers ----
function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function now() {
  return new Date().toLocaleTimeString();
}

function maskIP(multi = false) {
  return multi
    ? `${rand(10,200)}.${rand(0,255)}.${rand(0,255)}.xxx`
    : `192.168.${rand(0,255)}.xxx`;
}

// ---- Chart ----
const ctx = document.getElementById("trafficChart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Packets / sec",
      data: [],
      borderColor: "#00ffe0",
      tension: 0.4
    }]
  },
  options: {
    animation: false,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// ---- Simulation Core ----
function simulate(intensity, mode, defense) {

  let multiplier = intensity;
  if (mode.includes("Slow")) multiplier *= 0.6;
  if (mode.includes("Burst")) multiplier *= 1.8;

  let packets = rand(100, 300) * multiplier;
  let rps = rand(20, 80) * multiplier;
  let speed = rand(100, 400) * multiplier;

  let status = "OK";

  if (defense && packets > LIMITS.RATE_LIMIT) {
    packets *= 0.4;
    rps *= 0.5;
    status = "RATE-LIMITED";
  }

  if (packets > LIMITS.MAX_PACKETS) {
    status = "SERVICE DEGRADED";
  }

  return {
    time: now(),
    ip: maskIP(mode.includes("Multi")),
    packets: Math.floor(packets),
    rps: Math.floor(rps),
    speed: Math.floor(speed),
    type: PACKET_TYPES[rand(0, PACKET_TYPES.length)],
    status
  };
}

// ---- UI Update Loop ----
setInterval(() => {
  const intensity = +document.getElementById("intensity").value;
  const mode = document.getElementById("mode").value;
  const defense = document.getElementById("defense").checked;

  const d = simulate(intensity, mode, defense);

  // Stats
  document.getElementById("time").innerText = d.time;
  document.getElementById("ip").innerText = d.ip;
  document.getElementById("packets").innerText = d.packets;
  document.getElementById("ptype").innerText = d.type;
  document.getElementById("rps").innerText = d.rps;
  document.getElementById("speed").innerText = d.speed + " kbps";
  document.getElementById("status").innerText = d.status;

  // Chart
  chart.data.labels.push(d.time);
  chart.data.datasets[0].data.push(d.packets);

  if (chart.data.labels.length > 25) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update();

  // Logs
  const body = document.getElementById("logBody");
  body.insertAdjacentHTML("afterbegin", `
    <tr>
      <td>${d.time}</td>
      <td>${d.ip}</td>
      <td>${d.packets}</td>
      <td>${d.type}</td>
      <td>${d.rps}</td>
      <td>${d.speed} kbps</td>
      <td>${d.status}</td>
    </tr>
  `);

  if (body.rows.length > 20) body.deleteRow(20);

}, 1000);
