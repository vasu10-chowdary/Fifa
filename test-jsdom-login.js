const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('login.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("LOGIN PAGE ERROR:", err);
});
virtualConsole.on("log", (log) => {
  console.log("LOGIN PAGE LOG:", log);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "file://" + __dirname + "/login.html",
  virtualConsole
});

dom.window.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired in JSDOM (login)");
    setTimeout(() => {
        console.log("Done checking login");
    }, 1000);
});
