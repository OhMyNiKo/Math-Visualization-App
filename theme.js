/* theme.js: shared layer for every module of the Physics Intuition App.
   1. window.C  — the live canvas palette (dark or light); page scripts draw with C.acc, C.bg2, ...
   2. dark / light switch injected into the top bar; the choice persists in localStorage
   3. KaTeX (vendored, offline) auto-renders \( ... \) and \[ ... \] anywhere on the page
   4. "Solved live" cards get a small on/off switch that veils the readout when off
   Load this synchronously in <head>, before any page script. No network. */
(function(){
"use strict";
var DARK={bg:"#0d1117",panel:"#131a22",bg2:"#0f151c",grid:"#1b232d",hair:"#26313c",axis:"#33404d",
  dim:"#55616d",mut:"#8b98a5",ink:"#e6edf3",acc:"#4dd0b5",amber:"#f0b429",hot:"#ff6b5e",blue:"#6cb6ff",
  edge:"#04120d",violet:"#c792ea",accA:"rgba(77,208,181,",amberA:"rgba(240,180,41,",hotA:"rgba(255,107,94,",blueA:"rgba(108,182,255,",inkA:"rgba(230,237,243,",mutA:"rgba(139,152,165,"};
var LIGHT={bg:"#f3f5f8",panel:"#ffffff",bg2:"#fbfcfd",grid:"#e6eaf0",hair:"#d3dae3",axis:"#aeb8c4",
  dim:"#8a95a2",mut:"#55626f",ink:"#18212c",acc:"#0b8a76",amber:"#b0741a",hot:"#d23c33",blue:"#1f63b3",
  edge:"#18212c",violet:"#7c3fb8",accA:"rgba(11,138,118,",amberA:"rgba(176,116,26,",hotA:"rgba(210,60,51,",blueA:"rgba(31,99,179,",inkA:"rgba(24,33,44,",mutA:"rgba(85,98,111,"};
var KEY="pia-theme", KEY2="pia-solved";
function get(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function set(k,v){try{localStorage.setItem(k,v);}catch(e){}}
var theme=get(KEY)==="light"?"light":"dark";
var q=/[?&]theme=(light|dark)/.exec(location.search);if(q){theme=q[1];set(KEY,theme);}
window.C=Object.assign({},theme==="light"?LIGHT:DARK);
window.C.theme=theme;
document.documentElement.setAttribute("data-theme",theme);

/* vendored assets, relative to the app folder */
var base=(function(){var s=document.currentScript&&document.currentScript.src||"";return s.replace(/theme\.js.*$/,"");})();
function css(h){var l=document.createElement("link");l.rel="stylesheet";l.href=h;document.head.appendChild(l);}
function js(h,cb){var s=document.createElement("script");s.src=h;s.defer=true;if(cb)s.onload=cb;document.head.appendChild(s);}
css(base+"vendor/katex/katex.min.css");
css(base+"theme.css");
js(base+"vendor/katex/katex.min.js",function(){js(base+"vendor/katex/contrib/auto-render.min.js",function(){renderAll();});});

function renderAll(){
  if(!window.renderMathInElement)return;
  try{
    window.renderMathInElement(document.body,{delimiters:[
      {left:"\\[",right:"\\]",display:true},{left:"\\(",right:"\\)",display:false}],
      throwOnError:false,strict:false});
  }catch(e){}
}
window.piaRenderMath=function(el){
  if(!window.renderMathInElement)return;
  try{window.renderMathInElement(el||document.body,{delimiters:[
      {left:"\\[",right:"\\]",display:true},{left:"\\(",right:"\\)",display:false}],throwOnError:false,strict:false});}catch(e){}
};

function applyTheme(t){
  theme=t;set(KEY,t);
  document.documentElement.setAttribute("data-theme",t);
  var P=t==="light"?LIGHT:DARK;for(var k in P)window.C[k]=P[k];window.C.theme=t;
  var b=document.getElementById("piaTheme");if(b)b.innerHTML=label();
  window.dispatchEvent(new Event("themechange"));
  window.dispatchEvent(new Event("resize"));   /* every module redraws on resize */
}
function label(){return theme==="light"?"&#9790; Dark":"&#9788; Light";}

function ready(fn){if(document.readyState!=="loading")fn();else document.addEventListener("DOMContentLoaded",fn);}
ready(function(){
  /* theme switch in the top bar */
  var nav=document.querySelector(".top nav");
  if(nav){
    var b=document.createElement("button");b.id="piaTheme";b.className="tswitch";b.type="button";
    b.title="Switch between the dark and the light look";b.innerHTML=label();
    b.addEventListener("click",function(){applyTheme(theme==="light"?"dark":"light");});
    nav.appendChild(b);
  }
  /* solved-live switch on every readout card */
  var on=get(KEY2)!=="off";
  var heads=document.querySelectorAll(".card h3");
  Array.prototype.forEach.call(heads,function(h){
    if(!/solved live|readout|solved/i.test(h.textContent))return;
    var card=h.parentNode;card.classList.add("solvable");
    var sw=document.createElement("label");sw.className="lsw";sw.title="Show or hide the solved values";
    sw.innerHTML='<span class="lsw-t">'+(on?"on":"off")+'</span><span class="lsw-track"><span class="lsw-knob"></span></span>';
    h.appendChild(sw);
    function paint(){card.classList.toggle("veiled",!on);sw.querySelector(".lsw-t").textContent=on?"on":"off";sw.classList.toggle("on",on);}
    sw.addEventListener("click",function(e){e.preventDefault();on=!on;set(KEY2,on?"on":"off");
      Array.prototype.forEach.call(document.querySelectorAll(".card.solvable"),function(c){c.classList.toggle("veiled",!on);});
      Array.prototype.forEach.call(document.querySelectorAll(".lsw"),function(s){s.querySelector(".lsw-t").textContent=on?"on":"off";s.classList.toggle("on",on);});});
    paint();
  });
});
})();
