# maxmsp-osc-signal-tools

Lightweight Max/MSP tools for shaping OSC and control signals (gate, normalization, energy accumulation, and dampers) for real-time systems.

## What this is
A small and evolving set of signal-layer utilities I use as reusable building blocks between raw inputs (OSC, sensors, spectral analysis) and real-time audiovisual systems.

## Included
- Float → Gate (threshold-based event triggering)
- Normalize / Clamp
- Energy Accumulation (motion-driven boost with temporal decay)
- Temporal Dampers: EMA / Spring / asymmetric Attack–Release

## Getting Started
Open `oscToolkit/oscToolkit.maxpat` as the entry patch.
All modules and JS dependencies are loaded locally from the same folder.

## Requirements
- Max 8 / 9  
- Optional: [ease](https://github.com/Cycling74/ease) package, [Node for Max](https://cycling74.com/articles/node-for-max-intro-%E2%80%93-let%E2%80%99s-get-started) (not strictly required)
