// AttackReleaseLag.js
// Asymmetric lag (attack/release) for control-rate signals
//
// inlet 0: target (0..1)
// inlet 1: params
// outlet 0: output y (0..1)

inlets = 2;
outlets = 1;

var x = 0.0;    // target
var y = 0.0;    // output

// time constants (ms)
var attackMs  = 120.0;   // rising speed
var releaseMs = 60.0;    // falling speed

// clock step (ms) – match your metro
var dtMs = 20.0;

// clamp
var clampMin = 0.0;
var clampMax = 1.0;
var doClamp = 1;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function set_target(v) {
  if (isNaN(v)) return;
  x = doClamp ? clamp(v, clampMin, clampMax) : v;
}

function msg_float(v) {
  if (inlet === 0) set_target(v);
}

function msg_int(v) {
  if (inlet === 0) set_target(v);
}

// convert time constant (ms) to per-tick smoothing coefficient
// alpha = 1 - exp(-dt / tau)
function alphaFromTau(dt, tau) {
  tau = Math.max(0.0001, tau);
  return 1.0 - Math.exp(-dt / tau);
}

function bang() {
  var dt = Math.max(0.1, dtMs); // ms

  // choose attack or release depending on direction
  var tau = (x > y) ? attackMs : releaseMs;

  // if tau == 0 => immediate
  if (tau <= 0.0) {
    y = x;
  } else {
    var a = alphaFromTau(dt, tau);
    y = y + a * (x - y);
  }

  if (doClamp) y = clamp(y, clampMin, clampMax);
  outlet(0, y);
}

// --- params (send to inlet 1) ---
function set_attack_ms(ms)  { attackMs  = Math.max(0.0, ms); }
function set_release_ms(ms) { releaseMs = Math.max(0.0, ms); }
function set_dt_ms(ms)      { dtMs      = Math.max(0.1, ms); }

function reset(v) {
  if (isNaN(v)) v = x;
  set_target(v);
  y = x;
  outlet(0, y);
}

function set_clamp(minv, maxv) {
  clampMin = minv;
  clampMax = maxv;
}

function clamp_on(i) {
  doClamp = (i !== 0) ? 1 : 0;
}
