import { useEffect, useRef, useState } from 'react'
import { Spinner } from '../ui/index.jsx'

// ─────────────────────────────────────────────
//  BINA LAB TOOLKIT
//  Injected into every experiment's HTML before
//  it hits the iframe. LLMs reference these
//  globals by name — they never rewrite them.
// ─────────────────────────────────────────────

const LAB_TOOLKIT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0; padding: 0; height: 100%;
  font-family: 'IBM Plex Sans', sans-serif;
  background: #F0F4F8;
  color: #1a2634;
  overflow: hidden;
}

.lab {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
}

.lab-canvas-panel {
  background: #E8EFF5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 2px solid #C8D8E4;
  position: relative;
}

.lab-canvas-panel canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.lab-controls-panel {
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  gap: 14px;
  overflow-y: auto;
}

.lab-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5B8FA8;
  margin: 0 0 2px 0;
}

.lab-field { display: flex; flex-direction: column; gap: 5px; }

.lab-field label {
  font-size: 11px;
  font-weight: 600;
  color: #5B8FA8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.lab-input, .lab-select {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  padding: 8px 10px;
  border: 1.5px solid #C8D8E4;
  border-radius: 6px;
  background: #fff;
  color: #1a2634;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.lab-input:focus, .lab-select:focus { border-color: #3A8FB7; }

.lab-btn-row { display: flex; gap: 8px; flex-wrap: wrap; }

.lab-btn {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.lab-btn:active { transform: scale(0.97); }
.lab-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.lab-btn-primary  { background: #3A8FB7; color: #fff; }
.lab-btn-primary:hover:not(:disabled) { background: #2d7a9e; }

.lab-btn-secondary { background: #E8EFF5; color: #1a2634; border: 1.5px solid #C8D8E4; }
.lab-btn-secondary:hover:not(:disabled) { background: #d8e6ef; }

.lab-btn-accent { background: #2DC08A; color: #fff; }
.lab-btn-accent:hover:not(:disabled) { background: #25a878; }

.lab-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background: #E8EFF5;
  color: #5B8FA8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: all 0.2s;
}
.lab-badge.running { background: #FFF3CD; color: #856404; }
.lab-badge.done    { background: #D1FAE5; color: #065F46; }
.lab-badge::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.lab-table-wrap {
  flex: 1;
  overflow-y: auto;
  border: 1.5px solid #C8D8E4;
  border-radius: 8px;
  background: #fff;
  min-height: 80px;
}

.lab-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
}

.lab-table thead th {
  background: #E8EFF5;
  color: #5B8FA8;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1.5px solid #C8D8E4;
  font-family: 'IBM Plex Sans', sans-serif;
}

.lab-table tbody tr { border-bottom: 1px solid #EEF3F7; }
.lab-table tbody tr:last-child { border-bottom: none; }
.lab-table tbody tr:hover { background: #F5F9FC; }

.lab-table tbody td { padding: 9px 12px; color: #1a2634; }
.lab-table tbody td:first-child { color: #5B8FA8; font-weight: 600; }

.lab-readout {
  background: #1a2634;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lab-readout-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5B8FA8;
}
.lab-readout-value {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 22px;
  font-weight: 600;
  color: #2DC08A;
}
.lab-readout-unit { font-size: 13px; color: #5B8FA8; }

.lab-divider {
  border: none;
  border-top: 1.5px solid #E8EFF5;
  margin: 2px 0;
}
`

const LAB_TOOLKIT_JS = `
window.LabCanvas = (function () {
  let _c, _ctx, _animId;

  function init(id) {
    _c = document.getElementById(id);
    if (!_c) return;
    _c.width  = _c.parentElement.clientWidth  || 480;
    _c.height = _c.parentElement.clientHeight || 480;
    _ctx = _c.getContext('2d');
    return _ctx;
  }

  function clear() { _ctx && _ctx.clearRect(0, 0, _c.width, _c.height); }

  function drawBackground(color) {
    _ctx.fillStyle = color || '#E8EFF5';
    _ctx.fillRect(0, 0, _c.width, _c.height);
  }

  function drawRuler(maxM, ppm) {
    const x = 38;
    _ctx.strokeStyle = '#5B8FA8'; _ctx.lineWidth = 1.5;
    _ctx.beginPath(); _ctx.moveTo(x, 0); _ctx.lineTo(x, _c.height); _ctx.stroke();
    _ctx.font = '10px IBM Plex Mono, monospace';
    _ctx.fillStyle = '#5B8FA8'; _ctx.textAlign = 'right';
    for (let m = 0; m <= maxM; m += 0.25) {
      const y = m * ppm;
      const tick = m % 1 === 0 ? 10 : m % 0.5 === 0 ? 6 : 3;
      _ctx.beginPath(); _ctx.moveTo(x, y); _ctx.lineTo(x + tick, y); _ctx.stroke();
      if (m % 0.5 === 0) _ctx.fillText(m.toFixed(1) + 'm', x - 3, y + 4);
    }
  }

  function drawFloor(y) {
    _ctx.strokeStyle = '#3A8FB7'; _ctx.lineWidth = 2;
    _ctx.setLineDash([6, 3]);
    _ctx.beginPath(); _ctx.moveTo(42, y); _ctx.lineTo(_c.width, y); _ctx.stroke();
    _ctx.setLineDash([]);
    _ctx.font = '600 10px IBM Plex Sans, sans-serif';
    _ctx.fillStyle = '#3A8FB7'; _ctx.textAlign = 'left';
    _ctx.fillText('FLOOR', 46, y - 5);
  }

  function drawBall(x, y, r, color) {
    _ctx.beginPath(); _ctx.arc(x, y, r, 0, Math.PI * 2);
    const g = _ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.1, x, y, r);
    g.addColorStop(0, color || '#3A8FB7');
    g.addColorStop(1, '#1a5a7a');
    _ctx.fillStyle = g; _ctx.fill();
    _ctx.strokeStyle = 'rgba(0,0,0,0.2)'; _ctx.lineWidth = 1; _ctx.stroke();
  }

  function drawShadow(x, floorY, r, opacity) {
    _ctx.beginPath();
    _ctx.ellipse(x, floorY, r * 0.8, r * 0.18, 0, 0, Math.PI * 2);
    _ctx.fillStyle = 'rgba(0,0,0,' + (opacity || 0.1) + ')';
    _ctx.fill();
  }

  function drawHeightLine(x, y1, y2, label) {
    _ctx.strokeStyle = '#2DC08A'; _ctx.lineWidth = 1.5;
    _ctx.setLineDash([4, 3]);
    _ctx.beginPath(); _ctx.moveTo(x, y1); _ctx.lineTo(x, y2); _ctx.stroke();
    _ctx.setLineDash([]);
    [[x,y1,-1],[x,y2,1]].forEach(([ax,ay,d]) => {
      _ctx.fillStyle = '#2DC08A';
      _ctx.beginPath(); _ctx.moveTo(ax,ay); _ctx.lineTo(ax-4,ay+d*8); _ctx.lineTo(ax+4,ay+d*8);
      _ctx.closePath(); _ctx.fill();
    });
    if (label) {
      _ctx.font = '600 11px IBM Plex Mono, monospace';
      _ctx.fillStyle = '#2DC08A'; _ctx.textAlign = 'left';
      _ctx.fillText(label, x + 8, (y1 + y2) / 2 + 4);
    }
  }

  function stopAnimation() { if (_animId) cancelAnimationFrame(_animId); _animId = null; }
  function setAnimId(id) { _animId = id; }
  function getCanvas() { return _c; }
  function getCtx()    { return _ctx; }
  function getW()      { return _c ? _c.width : 0; }
  function getH()      { return _c ? _c.height : 0; }

  return { init, clear, drawBackground, drawRuler, drawFloor, drawBall, drawShadow, drawHeightLine, stopAnimation, setAnimId, getCanvas, getCtx, getW, getH };
})();

window.Physics = (function () {
  function freeFall({ height, ballRadiusPx, pixelsPerMeter, startY, floorY, centerX, onDone }) {
    const totalTime = Math.sqrt(2 * height / 9.81);
    let t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      const t = Math.min((ts - t0) / 1000, totalTime);
      const dropped = 0.5 * 9.81 * t * t * pixelsPerMeter;
      const by = startY + dropped;
      LabCanvas.clear();
      LabCanvas.drawBackground();
      LabCanvas.drawRuler(height + 0.3, pixelsPerMeter);
      LabCanvas.drawFloor(floorY);
      LabCanvas.drawHeightLine(centerX + ballRadiusPx + 14, startY, floorY, height.toFixed(2) + ' m');
      LabCanvas.drawShadow(centerX, floorY, ballRadiusPx, 0.05 + 0.2 * (t / totalTime));
      LabCanvas.drawBall(centerX, by, ballRadiusPx);
      if (t < totalTime) LabCanvas.setAnimId(requestAnimationFrame(frame));
      else if (onDone) onDone(totalTime);
    }
    LabCanvas.stopAnimation();
    LabCanvas.setAnimId(requestAnimationFrame(frame));
    return totalTime;
  }

  function calcFreeFallTime(h)   { return Math.sqrt(2 * h / 9.81); }
  function calcAcceleration(h,t) { return (2 * h) / (t * t); }

  return { freeFall, calcFreeFallTime, calcAcceleration };
})();

window.LabTable = (function () {
  let _id, _rows = [];
  function init(id) { _id = id; _rows = []; }
  function addRow(cells) { _rows.push(cells); _render(); }
  function clear() { _rows = []; _render(); }
  function _render() {
    const tb = document.querySelector('#' + _id + ' tbody');
    if (!tb) return;
    tb.innerHTML = '';
    _rows.forEach(cells => {
      const tr = document.createElement('tr');
      cells.forEach(c => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
      tb.appendChild(tr);
    });
  }
  return { init, addRow, clear };
})();

window.LabBadge = {
  set(id, text, state) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'lab-badge' + (state ? ' ' + state : '');
  }
};
`

// ─────────────────────────────────────────────
//  ExperimentCanvas component (unchanged API)
// ─────────────────────────────────────────────

export function ExperimentCanvas({ componentUrl }) {
  const iframeRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!componentUrl || componentUrl === '__SEED_PLACEHOLDER__') {
      setError('Experiment not available yet.')
      setLoading(false)
      return
    }

    const loadExperiment = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(componentUrl)
        if (!res.ok) throw new Error(`Failed to load experiment (${res.status})`)

        const htmlContent = await res.text()
        const fullHtml = makeFullHtmlDocument(htmlContent)

        const iframe = iframeRef.current
        if (iframe) iframe.srcdoc = fullHtml
      } catch (err) {
        console.error('Failed to load experiment:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadExperiment()
  }, [componentUrl])

  return (
    <div
      className="relative w-full rounded-card border border-[#D4E5E8] overflow-hidden bg-bg"
      style={{ minHeight: 480 }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-mid">Loading experiment...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg">
          <div className="text-center px-6">
            <p className="text-sm text-error font-medium">Could not load experiment</p>
            <p className="text-xs text-mid mt-1">{error}</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        title="Bina Virtual Lab"
        sandbox="allow-scripts allow-same-origin"
        className="w-full border-0"
        style={{ minHeight: 480, display: loading || error ? 'none' : 'block' }}
        onLoad={() => setLoading(false)}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
//  makeFullHtmlDocument — injects the toolkit
// ─────────────────────────────────────────────

function makeFullHtmlDocument(content) {
  const trimmed = content.trim()

  const injection = `
<style>${LAB_TOOLKIT_CSS}</style>
<script>${LAB_TOOLKIT_JS}<\/script>`

  // Already a full document — inject into <head>
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    if (trimmed.includes('</head>')) {
      return content.replace('</head>', injection + '\n</head>')
    }
    // No </head> — inject after <html> or at start of body
    return content.replace(/<body[^>]*>/, injection + '\n$&')
  }

  // Fragment — wrap it
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  ${injection}
</head>
<body>
${content}
</body>
</html>`
}