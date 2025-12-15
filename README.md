# maxmsp-osc-signal-tools

Lightweight Max/MSP tools for shaping OSC and control signals (gate, normalization, energy accumulation, and dampers) for real-time systems.

## What this is
A small and evolving set of signal-layer utilities I use as reusable building blocks between raw inputs (OSC, sensors, spectral analysis) and real-time audiovisual systems.

## Included
- Float → Gate (threshold-based event triggering)
- Normalize / Clamp
- Energy Accumulation (motion-driven boost with temporal decay)
- Temporal Dampers: EMA / Spring / asymmetric Attack–Release


## Tested in Max 8/9.
