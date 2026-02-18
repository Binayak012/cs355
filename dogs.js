const breedInput = document.getElementById("breed");
const list = document.getElementById("breeds");
const btn = document.getElementById("show");
const msg = document.getElementById("msg");
const img = document.getElementById("img");

let set = new Set();
let map = new Map();
let timer = null;

const norm = s => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
const canonical = s => {
  s = norm(s);
  if (!s) return null;
  if (map.has(s)) return map.get(s);
  if (s.includes("/") && set.has(s)) return s;
  const p = s.split(" ");
  if (p.length === 2 && set.has(`${p[0]}/${p[1]}`)) return `${p[0]}/${p[1]}`;
  if (p.length === 1 && set.has(p[0])) return p[0];
  return null;
};

const stop = () => { if (timer) clearInterval(timer); timer = null; };

const load = can => {
  fetch(`https://dog.ceo/api/breed/${can}/images/random`)
    .then(r => r.json())
    .then(d => {
      if (d.status !== "success") return;
      img.src = d.message;
      img.alt = can.replace("/", " ");
    })
    .catch(() => { msg.textContent = "Error"; });
};

fetch("https://dog.ceo/api/breeds/list/all")
  .then(r => r.json())
  .then(d => {
    const opts = [];
    Object.keys(d.message).forEach(br => {
      map.set(br, br); set.add(br); opts.push(br);
      (d.message[br] || []).forEach(sub => {
        const disp = `${br} ${sub}`, can = `${br}/${sub}`;
        map.set(disp, can); map.set(can, can); set.add(can); opts.push(disp);
      });
    });
    opts.sort().forEach(v => { const o = document.createElement("option"); o.value = v; list.appendChild(o); });
    msg.textContent = "Ready";
  })
  .catch(() => { msg.textContent = "Could not load breeds"; });

btn.onclick = () => {
  stop();
  const can = canonical(breedInput.value);
  if (!can) {
    msg.textContent = "No such breed";
    img.removeAttribute("src");
    img.alt = "";
    return;
  }
  msg.textContent = can.replace("/", " ");
  load(can);
  timer = setInterval(() => load(can), 5000);
};

breedInput.oninput = stop;
breedInput.onkeydown = e => { if (e.key === "Enter") btn.click(); };