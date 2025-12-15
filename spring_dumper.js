// SpringDamper2nd.js
// 2nd-order spring-damper for control-rate signals (0..1 by default)
//
// inlet 0: target (float 0..1)
// inlet 1: params (messages)
// outlet 0: output y

inlets = 2;
outlets = 1;

// --- state ---
var x = 0.0;   // target
var y = 0.0;   // position (output)
var v = 0.0;   // velocity

// --- params ---
// freqHz: natural frequency (how fast it tries to follow)
var freqHz = 2.5;      // 0.1..20 typical for control
// damping: damping ratio ζ
//   1.0 = critical (fast, no oscillation)
//   <1.0 = underdamped (bouncy)
//   >1.0 = overdamped (sluggish)
var damping = 0.9;     // 0..3
// dtSeconds: integration step in seconds (match your metro period)
var dt = 0.02;         // metro 20ms -> 0.02

// clamp output and target
var clampMin = 0.0;
var clampMax = 1.0;
var doClamp = 1;

// --- helpers ---
function clamp(val, lo, hi) { return Math.max(lo, Math.min(hi, val)); }

function set_target(val) {
  if (isNaN(val)) return;
  x = doClamp ? clamp(val, clampMin, clampMax) : val;
}

function msg_float(val) {
  if (inlet === 0) set_target(val);
}

function msg_int(val) {
  if (inlet === 0) set_target(val);
}

// --- main update (call every clock tick) ---
function bang() {
  // Convert params to continuous-time coefficients
  // ω = 2π f
  var w = 2.0 * Math.PI * Math.max(0.0001, freqHz);
  var z = Math.max(0.0, damping);

  // 2nd-order system:
  // y'' + 2ζω y' + ω^2 (y - x) = 0
  // => y'' = -2ζω y' - ω^2 (y - x)
  var a = (-2.0 * z * w * v) - (w * w * (y - x));

  // Semi-implicit Euler (stable enough for control-rate)
  v = v + a * dt;
  y = y + v * dt;

  if (doClamp) y = clamp(y, clampMin, clampMax);

  outlet(0, y);
}

// --- parameter setters (send to inlet 1) ---
function set_freq(hz) { // natural freq in Hz
  freqHz = Math.max(0.0001, hz);
}

function set_damping(zeta) { // damping ratio 
  damping = Math.max(0.0, zeta);
}

function set_dt(seconds) { // dt in seconds (e.g. 0.02)
  dt = Math.max(0.0005, seconds);
}

// convenience: set by your metro milliseconds
function set_dt_ms(ms) {
  dt = Math.max(0.0005, ms / 1000.0);
}

function reset(val) { // reset y and v to current target or given value
  if (isNaN(val)) val = x;
  set_target(val);
  y = x;
  v = 0.0;
  outlet(0, y);
}

function set_clamp(minv, maxv) {
  clampMin = minv;
  clampMax = maxv;
}

function clamp_on(i) {
  doClamp = (i !== 0) ? 1 : 0;
}
