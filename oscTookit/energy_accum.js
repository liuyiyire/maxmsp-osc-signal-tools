// Energy Accumulation with nonlinear charging
// Purpose: Convert noisy 0..1 control input into a gesture-like energy signal (0..1) with decay.
// Scheme A: charging efficiency decreases as E -> 1
//
// Inlets:
//   inlet 0: x (float 0..1) OR bang (time tick)
//   inlet 1: parameter messages
//
// Outlets:
//   outlet 0: shaped energy (0..1)
//
// --------------------------------------------

inlets = 2;
outlets = 1;

// ---------------- State ----------------
var prevX = 0.0;       // last input x
var E = 0.0;           // energy accumulator
var lastT = -1;        // last timestamp (ms)
var haveX = false;
var frozen = false;

// ---------------- Parameters ----------------
var threshold = 0.02;  // minimum change to count as activity
var gain = 1.0;        // base charging speed
var decay = 0.2;       // decay rate (energy per second)
var curve = 1.0;       // output shaping exponent

// Nonlinear charging (Scheme A)
var stiff = 2.0;       // difficulty exponent p (0 = linear)
var minCharge = 0.0;   // minimum charging factor (avoid stuck near 1)

var maxDt = 0.25;      // clamp dt to avoid huge decay jumps

// ---------------- Utils ----------------
function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function abs(x) {
  return x < 0 ? -x : x;
}

function emit() {
  var y = (curve === 1.0) ? E : Math.pow(E, curve);
  outlet(0, y);
}

function decayByDt(dt) {
  if (dt <= 0) return;
  E -= decay * dt;
  E = clamp(E, 0.0, 1.0);
}

// ---------------- inlet 0 ----------------
// float: new x value
function msg_float(x) {
  if (frozen) {
    emit();
    return;
  }

  x = clamp(x, 0.0, 1.0);

  var now = Date.now();
  var dt = 0.0;
  if (lastT >= 0) dt = (now - lastT) / 1000.0;
  lastT = now;
  dt = clamp(dt, 0.0, maxDt);

  // 1) decay always follows real time
  decayByDt(dt);

  // 2) compute activity
  var dx = haveX ? abs(x - prevX) : 0.0;
  prevX = x;
  haveX = true;

  // 3) threshold
  var excess = Math.max(0.0, dx - threshold);

  // 4) nonlinear charging (Scheme A)
  //    harder to charge when E is high
  var factor = Math.pow(1.0 - E, stiff);
  factor = Math.max(factor, minCharge);

  E += gain * excess * factor;
  E = clamp(E, 0.0, 1.0);

  emit();
}

// bang: time tick only (no accumulation)
function bang() {
  if (frozen) {
    emit();
    return;
  }

  var now = Date.now();

  if (lastT < 0) {
    lastT = now;
    emit();
    return;
  }

  var dt = (now - lastT) / 1000.0;
  lastT = now;
  dt = clamp(dt, 0.0, maxDt);

  decayByDt(dt);
  emit();
}

// ---------------- inlet 1 : parameter setters ----------------
function threshold_(v) { threshold = Math.max(0.0, v); }
function gain_(v)      { gain = Math.max(0.0, v); }
function decay_(v)     { decay = Math.max(0.0, v); }
function curve_(v)     { curve = Math.max(0.01, v); }

function stiff_(v)     { stiff = Math.max(0.0, v); }
function mincharge_(v) { minCharge = clamp(v, 0.0, 1.0); }

function maxdt_(v)     { maxDt = Math.max(0.0, v); }
function freeze_(v)    { frozen = (v !== 0); }

function reset() {
  prevX = 0.0;
  E = 0.0;
  lastT = -1;
  haveX = false;
  emit();
}
