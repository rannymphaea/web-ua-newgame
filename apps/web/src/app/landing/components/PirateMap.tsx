'use client';
import { useEffect, useRef } from 'react';

const SVG_W = 540, SVG_H = 420;
const TOTAL_STEPS = 10;

const NODES = [
  { id:'start',     x:.13,y:.10,type:'circle',  bg:'#9E2A2B',sz:56, lines:['START'],         sub:'',           order:0 },
  { id:'trainee',   x:.44,y:.13,type:'circle',  bg:'#335C67',sz:60, lines:['Trainee'],        sub:'New Player', order:1 },
  { id:'training',  x:.80,y:.30,type:'rect',    bg:'#335C67',w:84,h:46,lines:['Training','Phase'],sub:'',       order:2 },
  { id:'eligible',  x:.50,y:.50,type:'diamond', bg:'#E09F3E',sz:78, lines:['Eligible?'],       sub:'',           order:3 },
  { id:'associate', x:.50,y:.70,type:'circle',  bg:'#335C67',sz:64, lines:['Associate'],       sub:'',           order:5 },
  { id:'trainer',   x:.16,y:.58,type:'circle',  bg:'#9E2A2B',sz:60, lines:['Be','Trainer'],   sub:'',           order:7 },
  { id:'project',   x:.30,y:.84,type:'rect',    bg:'#335C67',w:80,h:44,lines:['Start','Project'],sub:'',        order:6 },
  { id:'soldat',    x:.59,y:.88,type:'circle',  bg:'#9E2A2B',sz:60, lines:['Soldat'],          sub:'',           order:8 },
  { id:'comp',      x:.84,y:.78,type:'circle',  bg:'#E09F3E',sz:62, lines:['Join','Comp.'],   sub:'',tc:'#2c1810',order:9 },
] as const;

type NodeId = typeof NODES[number]['id'];

const PATHS: { from: NodeId; to: NodeId; order: number; label?: string; labelColor?: string; curve?: string; dashed?: boolean }[] = [
  { from:'start',    to:'trainee',   order:1 },
  { from:'trainee',  to:'training',  order:2 },
  { from:'training', to:'eligible',  order:3 },
  { from:'eligible', to:'associate', order:4, label:'YES', labelColor:'#335C67' },
  { from:'eligible', to:'training',  order:4, label:'NO',  labelColor:'#9E2A2B',
    curve:'M {fx} {fy} C {fx-170} {fy} {fx-170} {ty} {tx} {ty}' },
  { from:'associate',to:'project',   order:6 },
  { from:'associate',to:'trainer',   order:7,
    curve:'M {fx} {fy} Q {(fx+tx)/2-60} {(fy+ty)/2} {tx} {ty}' },
  { from:'trainer',  to:'soldat',    order:8, dashed:true,
    curve:'M {fx} {fy} Q {fx+80} {(fy+ty)/2+20} {tx} {ty}' },
  { from:'project',  to:'soldat',    order:8 },
  { from:'soldat',   to:'comp',      order:9 },
];

function cx(node: typeof NODES[number]) { return node.x * SVG_W; }
function cy(node: typeof NODES[number]) { return node.y * SVG_H; }

function evalCurve(tpl: string, f: typeof NODES[number], t: typeof NODES[number]) {
  const fx=cx(f), fy=cy(f), tx=cx(t), ty=cy(t);
  return tpl
    .replace(/{fx}/g,String(fx)).replace(/{fy}/g,String(fy))
    .replace(/{tx}/g,String(tx)).replace(/{ty}/g,String(ty))
    .replace(/{fx-(\d+)}/g,(_,v)=>String(fx - Number(v)))
    .replace(/{fy-(\d+)}/g,(_,v)=>String(fy - Number(v)))
    .replace(/{fx\+(\d+)}/g,(_,v)=>String(fx + Number(v)))
    .replace(/{fy\+(\d+)}/g,(_,v)=>String(fy + Number(v)))
    .replace(/{\(fx\+tx\)\/2([+-]\d+)?}/g,(_,off)=>String((fx+tx)/2+(+(off||'0'))))
    .replace(/{\(fy\+ty\)\/2([+-]\d+)?}/g,(_,off)=>String((fy+ty)/2+(+(off||'0'))));
}

function easeOutCubic(t: number) { return 1 - Math.pow(1-t, 3); }

export default function PirateMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const rollRef    = useRef<HTMLDivElement>(null);
  const parchRef   = useRef<HTMLDivElement>(null);
  const tubTopRef  = useRef<HTMLDivElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const nodesLRef  = useRef<HTMLDivElement>(null);
  const progressRef= useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const ctrRef     = useRef<HTMLSpanElement>(null);
  const rafRef     = useRef<number>(0);
  const drawnRef   = useRef<Set<SVGElement>>(new Set());

  // Build DOM once
  useEffect(() => {
    const nodesL = nodesLRef.current;
    const svg    = svgRef.current;
    if (!nodesL || !svg) return;

    // Arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
    marker.setAttribute('id','mArr');
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','7');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','5');
    marker.setAttribute('markerHeight','5');
    marker.setAttribute('orient','auto-start-reverse');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    arrowPath.setAttribute('d','M2 1L8 5L2 9');
    arrowPath.setAttribute('fill','none');
    arrowPath.setAttribute('stroke','#2c1810');
    arrowPath.setAttribute('stroke-width','2');
    arrowPath.setAttribute('stroke-linecap','round');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Build nodes
    const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));
    NODES.forEach(n => {
      const el = document.createElement('div');
      el.className = 'mn';
      el.id = 'mn-' + n.id;
      el.style.left = (n.x * 100) + '%';
      el.style.top  = (n.y * 100) + '%';
      const tc = ('tc' in n && n.tc) ? n.tc : '#f5f0e8';
      if (n.type === 'circle') {
        const circ = document.createElement('div');
        circ.className = 'mn-circle';
        circ.style.cssText = `width:${n.sz}px;height:${n.sz}px;background:${n.bg};`;
        circ.innerHTML = n.lines.map(l=>`<span>${l}</span>`).join('<br>');
        if (n.sub) circ.innerHTML += `<div style="font-size:9px;opacity:.8;margin-top:2px;">${n.sub}</div>`;
        el.appendChild(circ);
      } else if (n.type === 'rect') {
        const rect = document.createElement('div');
        rect.className = 'mn-rect';
        const rn = n as typeof NODES[2];
        rect.style.cssText = `width:${rn.w}px;min-height:${rn.h}px;background:${n.bg};color:${tc};`;
        rect.innerHTML = n.lines.join('<br>');
        el.appendChild(rect);
      } else if (n.type === 'diamond') {
        const dw = document.createElement('div');
        dw.className = 'mn-diamond-w';
        dw.style.cssText = `width:${n.sz}px;height:${n.sz}px;`;
        const ds = document.createElement('div');
        ds.className = 'mn-diamond-s';
        ds.style.cssText = `width:${n.sz*.80}px;height:${n.sz*.80}px;background:${n.bg};`;
        const dt = document.createElement('div');
        dt.className = 'mn-diamond-t';
        dt.innerHTML = n.lines.join('<br>');
        dw.appendChild(ds); dw.appendChild(dt);
        el.appendChild(dw);
      }
      nodesL.appendChild(el);
    });

    // Build SVG paths
    PATHS.forEach(p => {
      const f = nodeMap[p.from] as typeof NODES[number];
      const t = nodeMap[p.to]   as typeof NODES[number];
      if (!f || !t) return;
      const d = p.curve ? evalCurve(p.curve, f, t) : `M ${cx(f)} ${cy(f)} L ${cx(t)} ${cy(t)}`;
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg','path');
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('fill','none');
      pathEl.setAttribute('stroke','#2c1810');
      pathEl.setAttribute('stroke-width', p.dashed ? '2' : '2.5');
      pathEl.setAttribute('stroke-linecap','round');
      pathEl.setAttribute('marker-end','url(#mArr)');
      pathEl.setAttribute('opacity', p.dashed ? '0.65' : '1');
      if (p.dashed) pathEl.setAttribute('stroke-dasharray','7 5');
      (pathEl as SVGElement & {dataset: DOMStringMap}).dataset.order = String(p.order);
      (pathEl as SVGElement & {dataset: DOMStringMap}).dataset.drawn = '0';
      pathEl.style.opacity = '0';
      svg.appendChild(pathEl);

      if (p.label) {
        const isYes = p.label === 'YES';
        const fx=cx(f), fy=cy(f), tx2=cx(t), ty2=cy(t);
        const lx = isYes ? fx+14 : fx-125;
        const ly = isYes ? (fy+ty2)/2-8 : fy-28;
        const txtEl = document.createElementNS('http://www.w3.org/2000/svg','text');
        txtEl.setAttribute('x',String(lx));
        txtEl.setAttribute('y',String(ly));
        txtEl.setAttribute('text-anchor','middle');
        txtEl.setAttribute('font-family','sans-serif');
        txtEl.setAttribute('font-size','13');
        txtEl.setAttribute('font-weight','bold');
        txtEl.setAttribute('fill', p.labelColor || '#2c1810');
        txtEl.textContent = p.label;
        (txtEl as SVGElement & {dataset: DOMStringMap}).dataset.order = String(p.order);
        txtEl.style.opacity = '0';
        txtEl.style.transition = 'opacity 0.4s ease';
        svg.appendChild(txtEl);
      }
    });

    return () => {
      // Full cleanup — innerHTML is reliable, also clears defs/marker
      nodesL.innerHTML = '';
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      drawnRef.current.clear();
    };
  }, []);

  // Scroll animation
  useEffect(() => {
    function animatePath(el: SVGElement) {
      if (drawnRef.current.has(el)) return;
      drawnRef.current.add(el);
      const pathEl = el as SVGPathElement;
      const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 200;
      pathEl.style.transition = 'none';
      pathEl.style.strokeDasharray = String(len);
      pathEl.style.strokeDashoffset = String(len);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        pathEl.style.transition = 'stroke-dashoffset 0.75s cubic-bezier(0.4,0,0.2,1), opacity 0.3s';
        pathEl.style.strokeDashoffset = '0';
      }));
    }
    function resetPath(el: SVGElement) {
      drawnRef.current.delete(el);
      const pathEl = el as SVGPathElement;
      pathEl.style.transition = 'none';
      const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 200;
      pathEl.style.strokeDasharray = String(len);
      pathEl.style.strokeDashoffset = String(len);
    }

    function update() {
      const section = sectionRef.current;
      const roll    = rollRef.current;
      const parch   = parchRef.current;
      const tubTop  = tubTopRef.current;
      const svg     = svgRef.current;
      const nodesL  = nodesLRef.current;
      if (!section || !roll || !parch || !svg || !nodesL) return;

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const raw = Math.max(0, Math.min(1, -rect.top / scrollable));

      if (progressRef.current) progressRef.current.style.width = (raw*100) + '%';
      if (hintRef.current)     hintRef.current.style.opacity   = raw < 0.04 ? '1' : '0';

      // Phase 1: Unroll (0 → 0.28)
      const unrollEnd = 0.28;
      const uP = Math.max(0, Math.min(1, raw / unrollEnd));
      const uE = easeOutCubic(uP);
      parch.style.minHeight = Math.round(uE * 420) + 'px';
      const rotX = 28 - uE * 28;
      roll.style.transform = `translateX(-50%) rotateX(${rotX}deg) scaleY(${uE})`;
      if (tubTop) tubTop.style.opacity = uP > 0.55 ? String(Math.min(1,(uP-0.55)*2.2)) : '0';

      // Phase 2: Reveal steps (0.28 → 1.0)
      if (raw >= unrollEnd) {
        const rP = (raw - unrollEnd) / (1 - unrollEnd);
        const step = Math.floor(rP * TOTAL_STEPS);
        if (ctrRef.current) ctrRef.current.textContent = Math.min(step, TOTAL_STEPS) + ' / ' + TOTAL_STEPS;

        NODES.forEach(n => {
          const el = document.getElementById('mn-' + n.id);
          if (el) el.classList.toggle('vis', n.order <= step);
        });

        Array.from(svg.querySelectorAll('[data-order]')).forEach(el => {
          const ord = parseInt((el as HTMLElement).dataset.order || '99');
          if (ord <= step) {
            (el as HTMLElement).style.opacity = '1';
            if (el.tagName === 'path') animatePath(el as SVGElement);
          } else {
            (el as HTMLElement).style.opacity = '0';
            if (el.tagName === 'path') resetPath(el as SVGElement);
          }
        });
      } else {
        if (ctrRef.current) ctrRef.current.textContent = '0 / ' + TOTAL_STEPS;
        NODES.forEach(n => { const el = document.getElementById('mn-' + n.id); if (el) el.classList.remove('vis'); });
        Array.from(svg.querySelectorAll('[data-order]')).forEach(el => {
          (el as HTMLElement).style.opacity = '0';
          if (el.tagName === 'path') resetPath(el as SVGElement);
        });
      }
    }

    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    }

    const controller = new AbortController();
    const { signal } = controller;
    window.addEventListener('scroll', onScroll, { passive: true, signal });
    window.addEventListener('resize', onScroll, { signal });
    update();
    return () => {
      controller.abort(); // removes both scroll + resize listeners
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="pemetaan" className="map-scroll-section">
      <div className="map-sticky-container">
        {/* Progress bar */}
        <div className="map-progress" ref={progressRef} />

        <div className="reveal" style={{ textAlign:'center', marginBottom:20, position:'relative', zIndex:2 }}>
          <p className="section-badge">Alur</p>
          <h2 className="section-title">Pemetaan Alur Anggota</h2>
        </div>

        <div className="map-scene">
          {/* Scroll roll */}
          <div className="scroll-roll" ref={rollRef}>
            {/* Top tube */}
            <div className="scroll-tube-top" ref={tubTopRef} />
            {/* Torn edge */}
            <div className="torn-edge-top" />

            {/* Parchment body */}
            <div className="parchment-body" ref={parchRef}>
              {/* SVG path layer */}
              <svg
                ref={svgRef}
                className="map-svg-layer"
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                preserveAspectRatio="none"
              />
              {/* HTML node layer */}
              <div className="map-nodes-layer" ref={nodesLRef} />

              {/* Decorations */}
              <div className="map-deco-compass">🧭</div>
              <div className="map-deco-brand">✦ NEWGAME ✦</div>
            </div>

            {/* Bottom tube */}
            <div className="scroll-tube-bottom" />
          </div>

          {/* Step counter */}
          <div className="map-step-ctr">
            <span ref={ctrRef}>0 / {TOTAL_STEPS}</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="map-scroll-hint" ref={hintRef}>▼ scroll untuk membuka peta ▼</div>
      </div>
    </section>
  );
}
