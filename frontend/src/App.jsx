import Shelter3D from "./Shelter3D";
import React from "react";
import { useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Activity, Building2, Check,
  ChevronDown, CircleHelp, CloudRain, Compass, Download, Droplets, Globe2,
  Leaf, MapPin, Menu, Moon, Mountain, PanelsTopLeft, RotateCcw, ShieldCheck,
  SlidersHorizontal, Sun, Thermometer, Wind, Zap
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const demoClimate = {
  climate_type: 'Hot & semi-humid',
  temperature_c: 33.8,
  humidity_percent: 61,
  rainfall_mm_year: 884,
  solar_radiation_kwh_m2_day: 5.7,
  wind_speed_kmh: 13.2,
  wind_direction: 'SW',
  data_source: 'Illustrative demo data'
};

const demoDesign = {
  climate: demoClimate,
  design: {
    orientation: 'Reduce east-west solar exposure',
    wall_material: 'Compressed earth block',
    roof: 'Reflective insulated sloped roof',
    insulation: 'Medium-high',
    ventilation: 'Cross ventilation with shaded openings',
    shading: 'Deep external shading + roof overhangs',
    window_strategy: 'Opposing shaded openings',
    rainwater_harvesting: true,
    solar_panels_recommended: true
  },
  scores: {
    thermal_comfort: 91,
    energy_efficiency: 86,
    cost_efficiency: 88,
    climate_resilience: 89,
    environmental_impact: 92,
    overall: 90
  },
  estimated_cost_inr: 480000,
  estimated_energy_kwh_day: 8.4,
  explanation: [
    'External shading limits direct solar heat gain through openings.',
    'Cross ventilation can improve comfort when outdoor conditions and site wind allow.',
    'A reflective insulated roof helps reduce heat transfer into the living space.',
    'Locally available low-carbon materials may reduce transport and embodied impacts.'
  ]
};

const fmt = n => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

function ScoreBar({ label, value, color = 'mint' }) {
  return <div className="score-row">
    <div className="score-label"><span>{label}</span><strong>{value}<small>/100</small></strong></div>
    <div className="score-track"><div className={`score-fill ${color}`} style={{ width: `${value}%` }} /></div>
  </div>;
}

function Metric({ icon: Icon, label, value, unit, note }) {
  return <div className="metric-card">
    <div className="metric-top"><span className="metric-icon"><Icon size={17} /></span><span className="metric-label">{label}</span></div>
    <div className="metric-value">{value}<small>{unit}</small></div>
    <div className="metric-note">{note}</div>
  </div>;
}

function HouseIllustration({ variant = 'balanced' }) {
  return <div className={`house-scene ${variant}`} aria-label="Illustrative climate-responsive shelter visualization">
    <div className="scene-glow" />
    <div className="sun-orb"><Sun size={23} /></div>
    <div className="sun-path" />
    <div className="terrain terrain-back" />
    <div className="terrain terrain-front" />
    <div className="tree tree-one"><i /><b /><em /></div>
    <div className="tree tree-two"><i /><b /><em /></div>
    <div className="house-shadow" />
    <div className="house">
      <div className="roof-left" /><div className="roof-right" />
      <div className="wall wall-left">
        <div className="window window-a"><span /></div><div className="door" />
      </div>
      <div className="wall wall-right">
        <div className="window window-b"><span /></div><div className="vent-slats"><i /><i /><i /><i /></div>
      </div>
      <div className="roof-panel"><i /><i /><i /><i /><i /><i /></div>
      <div className="roof-edge" />
    </div>
    <div className="airflow airflow-one"><span /><span /><span /></div>
    <div className="airflow airflow-two"><span /><span /><span /></div>
    <div className="scene-label label-solar"><Sun size={13} /> Solar gain controlled</div>
    <div className="scene-label label-wind"><Wind size={13} /> Passive airflow</div>
    <div className="scene-caption"><span className="live-dot" /> CONCEPT VISUALIZATION <span>NOT TO SCALE</span></div>
  </div>;
}

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [location, setLocation] = useState('Hyderabad, India');
  const [area, setArea] = useState('800');
  const [budget, setBudget] = useState('500000');
  const [occupants, setOccupants] = useState('4');
  const [floors, setFloors] = useState('2');
  const [temperature, setTemperature] = useState('34');
  const [humidity, setHumidity] = useState('62');
  const [rainfall, setRainfall] = useState('900');
  const [solar, setSolar] = useState('5.8');
  const [wind, setWind] = useState('14');
  const [priority, setPriority] = useState('balanced');
  const [result, setResult] = useState(demoDesign);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('Showing illustrative sample results. Enter your conditions and generate a concept.');
  const [menuOpen, setMenuOpen] = useState(false);

  const climate = result?.climate || demoClimate;
  const design = result?.design || demoDesign.design;
  const scores = result?.scores || demoDesign.scores;

  const alternatives = useMemo(() => {
    const base = result || demoDesign;
    return [
      { key: 'budget', title: 'Lowest cost', tag: 'BUDGET-FIRST', desc: 'Prioritizes simple construction and locally available materials.', cost: Math.round(base.estimated_cost_inr * .84), comfort: Math.max(65, (base.scores.thermal_comfort || 85) - 9), carbon: Math.max(55, (base.scores.environmental_impact || 85) - 4) },
      { key: 'balanced', title: 'Balanced comfort', tag: 'RECOMMENDED', desc: 'Balances predicted comfort, cost, energy and resilience.', cost: base.estimated_cost_inr, comfort: base.scores.thermal_comfort || 89, carbon: base.scores.environmental_impact || 88 },
      { key: 'carbon', title: 'Lowest carbon', tag: 'LOW IMPACT', desc: 'Prioritizes low-carbon materials and passive strategies.', cost: Math.round(base.estimated_cost_inr * 1.06), comfort: Math.max(70, (base.scores.thermal_comfort || 85) - 2), carbon: Math.min(99, (base.scores.environmental_impact || 85) + 6) }
    ];
  }, [result]);

  async function generateDesign() {
    setLoading(true);
    setNotice('Analyzing site conditions and comparing design options…');
   
const payload = {
  location,
  temperature: Number(temperature),
  humidity: Number(humidity),
  rainfall: Number(rainfall),
  solar_radiation: Number(solar),
  wind_speed: Number(wind),
  area_sqft: Number(area),
  budget: Number(budget),
  occupants: Number(occupants),
  floors: Math.max(1, Math.min(3, Number(floors) || 1)),
  priority,
};
    try {
      const response = await fetch(`${API_BASE}/api/design`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      // Normalize the backend response shape for the UI.
      const normalized = {
        climate: {
          ...demoClimate,
          temperature_c: payload.temperature, humidity_percent: payload.humidity,
          rainfall_mm_year: payload.rainfall, solar_radiation_kwh_m2_day: payload.solar_radiation,
          wind_speed_kmh: payload.wind_speed, data_source: 'User-entered values'
        },
        design: data.recommendations || demoDesign.design,
        model_parameters: data.model_parameters || {},
        scores: data.scores || demoDesign.scores,
        estimated_cost_inr: data.estimated_cost ?? data.estimated_cost_inr ?? 0,
        estimated_energy_kwh_day: data.estimated_energy_kwh_day ?? 8.4,
        explanation: data.explanation || [
          `The rules-based prototype classified the conditions as ${data.climate_type || 'local climate'}.`,
          'Recommendations should be checked against local codes, site constraints and professional advice.'
        ]
      };
      setResult(normalized);
      setNotice('Concept generated by your local backend. Climate values are user-entered, not live observations.');
    } catch (e) {
      const local = structuredClone(demoDesign);
      local.climate = {
        ...demoClimate,
        temperature_c: payload.temperature, humidity_percent: payload.humidity,
        rainfall_mm_year: payload.rainfall, solar_radiation_kwh_m2_day: payload.solar_radiation,
        wind_speed_kmh: payload.wind_speed, data_source: 'User-entered values'
      };
      local.estimated_cost_inr = Math.round(Number(area || 800) * 600);
      if (payload.temperature >= 30 && payload.humidity >= 60) {
        local.climate.climate_type = 'Hot & humid';
        local.design.ventilation = 'Cross ventilation with shaded openings';
      } else if (payload.temperature >= 30) {
        local.climate.climate_type = 'Hot & dry';
        local.design.shading = 'Deep external shading';
      } else if (payload.temperature <= 18) {
        local.climate.climate_type = 'Cold';
        local.design.insulation = 'High';
      }
      setResult(local);
      setNotice(`Demo mode: backend unavailable (${e.message}). Start FastAPI for backend-generated results.`);
    } finally {
      setLoading(false);
      setActiveTab('Overview');
    }
  }

  function exportSummary() {
    const summary = {
      product: 'TerraForm AI — Climate Shelter Concept',
      location, priority, climate, design, scores,
      estimated_cost_inr: result.estimated_cost_inr,
      estimated_energy_kwh_day: result.estimated_energy_kwh_day,
      notice: 'Concept estimate only. Not a certified architectural or structural design.'
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'climate-shelter-concept.json'; a.click();
    URL.revokeObjectURL(url);
  }

  const navItems = ['Overview', 'Design Lab', 'Climate Data', 'Impact'];

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <a className="brand" href="#top" onClick={() => setActiveTab('Overview')}>
        <span className="brand-mark"><PanelsTopLeft size={22} /></span>
        <span><strong>terra<span>form</span></strong><small>CLIMATE SHELTER AI</small></span>
      </a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        {navItems.map((item, i) => {
          const Icon = [PanelsTopLeft, Building2, Globe2, Leaf][i];
          return <button key={item} className={activeTab === item ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveTab(item); setMenuOpen(false); }}>
            <Icon size={18} /><span>{item}</span>{item === 'Design Lab' && <span className="nav-new">NEW</span>}
          </button>;
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><span className="tip-icon"><Leaf size={16} /></span><strong>Design with the planet.</strong><p>Every decision can make a shelter more resilient.</p><button onClick={() => setActiveTab('Impact')}>Explore impact <ArrowRight size={14} /></button></div>
        <button className="profile-button"><span className="avatar">G</span><span><strong>Guest workspace</strong><small>Local prototype</small></span><ChevronDown size={15} /></button>
      </div>
    </aside>

    <main className="main-area" id="top">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)}><Menu size={19} /></button>
        <div className="breadcrumbs">Workspace <span>/</span> <strong>{activeTab}</strong></div>
        <div className="top-actions"><span className="system-status"><i /> SYSTEM READY</span><button className="help-button" title="About this prototype"><CircleHelp size={17} /></button><span className="avatar small">G</span></div>
      </header>

      <div className="page-content">
        <section className="welcome-row">
          <div><div className="eyebrow"><span className="eyebrow-line" /> CLIMATE-RESPONSIVE ARCHITECTURE</div>
            <h1>A home that<br /><em>understands its climate.</em></h1>
            <p className="intro">Turn local environmental conditions into shelter concepts designed for comfort, resilience and a lighter footprint.</p>
          </div>
          <div className="date-chip"><Activity size={15} /> DESIGN INTELLIGENCE <span>v0.1</span></div>
        </section>

        <section className="site-bar">
          <div className="site-location"><MapPin size={18} /><div><small>PROJECT LOCATION</small><input aria-label="Project location" value={location} onChange={e => setLocation(e.target.value)} /></div></div>
          <div className="site-divider" />
          <div className="site-detail"><small>SHELTER AREA</small><strong><input value={area} onChange={e => setArea(e.target.value)} type="number" min="51" /> <span>sq ft</span></strong></div>
          <div className="site-divider" />
          <div className="site-detail"><small>PROJECT BUDGET</small><strong><span>₹</span><input value={budget} onChange={e => setBudget(e.target.value)} type="number" min="1" /></strong></div>
          <button className="generate-button" onClick={generateDesign} disabled={loading}>{loading ? <RotateCcw size={17} className="spin" /> : <Zap size={17} />}{loading ? 'Analyzing' : 'Generate design'}<ArrowRight size={16} /></button>
        </section>

        <div className="notice"><CircleHelp size={15} /><span>{notice}</span></div>

        {activeTab === 'Overview' && <>
          <section className="section-heading"><div><h2>Site intelligence</h2><p>Environmental signals shaping your shelter concept.</p></div><span className="updated-label"><span className="live-dot" /> {climate.data_source || 'DEMO DATA'}</span></section>
          <section className="metrics-grid">
            <Metric icon={Thermometer} label="AIR TEMPERATURE" value={climate.temperature_c} unit="°C" note="Design for peak heat" />
            <Metric icon={Droplets} label="RELATIVE HUMIDITY" value={climate.humidity_percent} unit="%" note="Moisture & airflow" />
            <Metric icon={Sun} label="SOLAR RADIATION" value={climate.solar_radiation_kwh_m2_day} unit=" kWh/m²" note="Daily average input" />
            <Metric icon={CloudRain} label="ANNUAL RAINFALL" value={climate.rainfall_mm_year} unit=" mm" note="Roof & water strategy" />
          </section>
          <section className="hero-grid">
            <div className="panel visualization-panel">
              <div className="panel-heading"><div><span className="panel-kicker">DESIGN PREVIEW</span><h3>Your climate-responsive shelter</h3></div><button className="icon-button" onClick={() => setActiveTab('Design Lab')} title="Open Design Lab"><ArrowUpRight size={18} /></button></div>
              <HouseIllustration variant={priority} />
              
<section className="panel" style={{ marginTop: 24, padding: 24 }}>
  <div className="panel-heading">
    <div>
      <span className="panel-kicker">INTERACTIVE 3D MODEL</span>
      <h3>Explore your shelter in 360°</h3>
    </div>
    <span>360°</span>
  </div>
  <p className="panel-copy">
    Drag to rotate the shelter and scroll to zoom.
  </p>
  <Shelter3D parameters={{
    floor_area_sqft: Number(area) || 800,
    occupants: Number(occupants) || 4,
    bedrooms: Math.max(1, Math.ceil((Number(occupants) || 4) / 2)),
    floors: Math.max(1, Math.min(3, Number(floors) || 1)),
    temperature_c: Number(temperature) || 32,
    humidity_percent: Number(humidity) || 62,
    rainfall_mm_year: Number(rainfall) || 900,
    solar_radiation_kwh_m2_day: Number(solar) || 5.2,
    wind_speed_kmh: Number(wind) || 14,
    roof_pitch_degrees: Number(rainfall) >= 1500 ? 40 : Number(rainfall) >= 900 ? 30 : 22,
    roof_overhang_ft: Number(temperature) >= 30 || Number(solar) >= 5 ? 3 : 2,
    solar_panel_count: Math.max(0, Math.min(8, Math.round((Number(solar) >= 6 ? 8 : Number(solar) >= 5 ? 6 : Number(solar) >= 3.5 ? 4 : Number(solar) >= 2.5 ? 2 : 0) * (Number(area) < 350 ? 0.65 : Number(area) < 700 ? 0.85 : 1)))),
    rainwater_tank_liters: Number(rainfall) >= 1800 ? 6000 : Number(rainfall) >= 1200 ? 4000 : Number(rainfall) >= 700 ? 2500 : Number(rainfall) >= 350 ? 1000 : 0,
    ventilation_openings: Number(humidity) >= 70 ? 6 : Number(temperature) >= 28 ? 6 : 4,
    hot_climate: Number(temperature) >= 30,
    humid_climate: Number(humidity) >= 70
  }} />
</section>
              <div className="visual-legend"><span><i className="legend-wind" /> Air movement</span><span><i className="legend-solar" /> Solar control</span><span><i className="legend-green" /> Low-impact strategy</span></div>
            </div>
            <div className="panel score-panel">
              <div className="panel-heading"><div><span className="panel-kicker">PERFORMANCE MODEL</span><h3>Design scorecard</h3></div><span className="score-total">{scores.overall || 90}<small>/100</small></span></div>
              <p className="panel-copy">A multi-factor view of how the concept balances competing goals.</p>
              <ScoreBar label="Thermal comfort" value={scores.thermal_comfort || 91} />
              <ScoreBar label="Energy efficiency" value={scores.energy_efficiency || 86} />
              <ScoreBar label="Cost efficiency" value={scores.cost_efficiency || 88} color="gold" />
              <ScoreBar label="Climate resilience" value={scores.climate_resilience || 89} color="blue" />
              <ScoreBar label="Environmental impact" value={scores.environmental_impact || 92} />
              <div className="score-foot"><ShieldCheck size={16} /><span>Concept-stage estimates — not validated building simulation.</span></div>
            </div>
          </section>
          <section className="section-heading alternatives-heading"><div><h2>Three ways to build better</h2><p>Explore different priorities before committing to a design.</p></div><button className="text-button" onClick={() => setActiveTab('Design Lab')}>Open design lab <ArrowRight size={15} /></button></section>
          <section className="alternatives-grid">
            {alternatives.map((alt, idx) => <button key={alt.key} className={`alternative-card ${priority === alt.key ? 'selected' : ''}`} onClick={() => { setPriority(alt.key); setActiveTab('Design Lab'); }}>
              <div className="alt-top"><span className={`alt-icon alt-${alt.key}`}>{idx === 0 ? <Building2 size={18} /> : idx === 1 ? <Activity size={18} /> : <Leaf size={18} />}</span><span className="alt-tag">{alt.tag}</span></div>
              <h3>{alt.title}</h3><p>{alt.desc}</p>
              <div className="alt-stats"><span>Est. cost<strong>₹{fmt(alt.cost)}</strong></span><span>Comfort<strong>{alt.comfort}/100</strong></span></div>
              <div className="alt-footer">{priority === alt.key ? 'CURRENT PRIORITY' : 'EXPLORE OPTION'} <ArrowUpRight size={15} /></div>
            </button>)}
          </section>
        </>}

        {activeTab === 'Design Lab' && <section className="design-lab">
          <div className="section-heading"><div><h2>Design Lab</h2><p>Adjust the climate assumptions, then generate a new concept.</p></div><span className="updated-label">RULE-BASED PROTOTYPE</span></div>
          <div className="lab-grid">
            <div className="panel form-panel">
              <div className="panel-heading"><div><span className="panel-kicker">SITE CONDITIONS</span><h3>Environmental inputs</h3></div><SlidersHorizontal size={19} /></div>
              <p className="panel-copy">Enter known site values. Real data integration is a future step.</p>
              <div className="form-grid">
                <label>Temperature (°C)<input type="number" value={temperature} onChange={e => setTemperature(e.target.value)} /></label>
                <label>Humidity (%)<input type="number" min="0" max="100" value={humidity} onChange={e => setHumidity(e.target.value)} /></label>
                <label>Annual rainfall (mm)<input type="number" min="0" value={rainfall} onChange={e => setRainfall(e.target.value)} /></label>
                <label>Solar radiation (kWh/m²/day)<input type="number" min="0" step=".1" value={solar} onChange={e => setSolar(e.target.value)} /></label>
                <label>Wind speed (km/h)<input type="number" min="0" value={wind} onChange={e => setWind(e.target.value)} /></label>
                <label>Occupants<input type="number" min="1" value={occupants} onChange={e => setOccupants(e.target.value)} /></label>
                <label>Number of floors (maximum 3)
                  <select value={floors} onChange={e => setFloors(String(Math.max(1, Math.min(3, Number(e.target.value) || 1))))}>
                    <option value="1">1 Floor</option>
                    <option value="2">2 Floors — Duplex</option>
                    <option value="3">3 Floors — Premium Home</option>
                  </select>
                </label>
              </div>
              <div className="field-label">OPTIMIZATION PRIORITY</div>
              <div className="priority-options">
                {[['balanced','Balanced'],['budget','Lowest cost'],['carbon','Low carbon']].map(([key,label]) => <button key={key} onClick={() => setPriority(key)} className={priority === key ? 'priority-option chosen' : 'priority-option'}>{priority === key && <Check size={14} />}{label}</button>)}
              </div>
              <button className="generate-button full" onClick={generateDesign} disabled={loading}>{loading ? 'Optimizing concept…' : 'Generate shelter concept'}<ArrowRight size={16} /></button>
            </div>
            <div className="panel result-panel">
              <div className="panel-heading"><div><span className="panel-kicker">RECOMMENDED CONCEPT</span><h3>Design specification</h3></div><span className="result-dot">●</span></div>
              <HouseIllustration variant={priority} />
              <div className="spec-list">
                {[
                  ['Orientation', design.orientation, Compass],
                  ['Wall material', design.wall_material, Mountain],
                  ['Roof system', design.roof, PanelsTopLeft],
                  ['Ventilation', design.ventilation, Wind],
                  ['Shading', design.shading, Sun],
                  ['Insulation', design.insulation, ShieldCheck],
                ].map(([label,value,Icon]) => <div className="spec-row" key={label}><span className="spec-icon"><Icon size={16} /></span><span className="spec-label">{label}</span><strong>{value || 'To be evaluated'}</strong></div>)}
              </div>
              <button className="outline-button full" onClick={exportSummary}><Download size={16} /> Export concept summary (JSON)</button>
            </div>
          </div>
        </section>}

        {activeTab === 'Climate Data' && <section>
          <div className="section-heading"><div><h2>Climate profile</h2><p>Current prototype values for the selected design scenario.</p></div><span className="updated-label">{climate.data_source || 'DEMO DATA'}</span></div>
          <div className="metrics-grid">
            <Metric icon={Thermometer} label="TEMPERATURE" value={climate.temperature_c} unit="°C" note="User-entered scenario" />
            <Metric icon={Droplets} label="HUMIDITY" value={climate.humidity_percent} unit="%" note="Relative humidity" />
            <Metric icon={Wind} label="WIND SPEED" value={climate.wind_speed_kmh} unit=" km/h" note={climate.wind_direction || 'Direction not verified'} />
            <Metric icon={CloudRain} label="RAINFALL" value={climate.rainfall_mm_year} unit=" mm" note="Annual total assumption" />
          </div>
          <div className="panel climate-panel"><div className="panel-heading"><div><span className="panel-kicker">SITE SUMMARY</span><h3>{location || 'Unnamed location'}</h3></div><MapPin size={18} /></div><div className="climate-summary"><div><span>Climate classification</span><strong>{climate.climate_type}</strong></div><div><span>Solar resource</span><strong>{climate.solar_radiation_kwh_m2_day} kWh/m²/day</strong></div><div><span>Annual rainfall</span><strong>{climate.rainfall_mm_year} mm</strong></div><div><span>Wind speed</span><strong>{climate.wind_speed_kmh} km/h</strong></div></div><p className="disclaimer">These values are illustrative or manually entered, not verified live observations. Add a geocoder and trusted climate data source before presenting location-specific conclusions.</p></div>
        </section>}
        

        {activeTab === 'Impact' && <section>
          <div className="section-heading"><div><h2>Impact & resilience</h2><p>See how design choices can support a more resilient, lower-impact shelter.</p></div><span className="updated-label">ESTIMATES</span></div>
          <div className="impact-hero"><div><span className="panel-kicker">DESIGN INTENT</span><h2>Comfort is a system,<br /><em>not a single material.</em></h2><p>Orientation, shading, roof reflectance, insulation and ventilation work together. The best combination depends on local weather, site geometry and occupant needs.</p><button className="generate-button" onClick={() => setActiveTab('Design Lab')}>Tune design parameters <ArrowRight size={16} /></button></div><div className="impact-big-score"><Leaf size={28} /><strong>{scores.environmental_impact || 92}<small>/100</small></strong><span>ILLUSTRATIVE ENVIRONMENTAL SCORE</span></div></div>
          <div className="impact-grid">
            <div className="panel impact-card"><span className="impact-icon"><Zap size={19} /></span><h3>Lower energy demand</h3><p>Prioritize passive cooling and reduce unwanted heat gain before sizing active cooling equipment.</p><strong>Target: passive-first design</strong></div>
            <div className="panel impact-card"><span className="impact-icon"><Leaf size={19} /></span><h3>Material footprint</h3><p>Compare locally available materials using verified embodied-carbon and durability information.</p><strong>Target: low-carbon sourcing</strong></div>
            <div className="panel impact-card"><span className="impact-icon"><CloudRain size={19} /></span><h3>Climate resilience</h3><p>Account for intense rain, heat waves, wind exposure, drainage and local hazard maps.</p><strong>Target: site-specific resilience</strong></div>
          </div>
          <button className="outline-button" onClick={exportSummary}><Download size={16} /> Export concept summary (JSON)</button>
        </section>}

        <footer className="page-footer"><span>© 2026 TERRAFORM AI <i /> BUILT FOR A RESILIENT FUTURE</span><span><ShieldCheck size={14} /> Concept tool · Professional verification required</span></footer>
      </div>
    </main>
  </div>;
}

export default App;
