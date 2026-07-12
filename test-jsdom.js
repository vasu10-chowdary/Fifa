const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('dashboard.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("PAGE ERROR:", err);
});
virtualConsole.on("log", (log) => {
  console.log("PAGE LOG:", log);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "file://" + __dirname + "/dashboard.html",
  virtualConsole
});

dom.window.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired in JSDOM");
    // wait a second for async scripts
    setTimeout(() => {
        console.log("Done checking");
    }, 1000);
});
