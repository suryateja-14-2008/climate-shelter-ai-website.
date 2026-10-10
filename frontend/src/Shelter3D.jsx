import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

const VIEWS = ["Exterior", "Interior", "Structure", "Sustainability", "Climate", "Thermal"];
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(v)) ? Number(v) : min));
const getNumber = (p, key, fallback) => {
  const n = Number(p?.[key]);
  return Number.isFinite(n) ? n : fallback;
};

function Block({ position, size, color, rotation = [0, 0, 0], roughness = 0.78, metalness = 0 }) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
  </mesh>;
}

function Label({ position, children }) {
  return <group position={position}>
    <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
      <div style={{ background: "#173e2d", color: "#fff", padding: "5px 8px", borderRadius: 7, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</div>
    </Html>
  </group>;
}

function Window({ position, width = 0.82, height = 0.78 }) {
  return <group position={position}>
    <Block position={[0, 0, 0]} size={[width, height, 0.045]} color="#75c5dc" roughness={0.22} />
    {[-width / 2, width / 2].map(x => <Block key={x} position={[x, 0, 0.035]} size={[0.045, height + 0.08, 0.06]} color="#f6efe1" />)}
    {[-height / 2, height / 2].map(y => <Block key={y} position={[0, y, 0.035]} size={[width + 0.08, 0.045, 0.06]} color="#f6efe1" />)}
    <Block position={[0, 0, 0.055]} size={[0.025, height, 0.025]} color="#e8e1d3" />
    <Block position={[0, 0, 0.055]} size={[width, 0.025, 0.025]} color="#e8e1d3" />
  </group>;
}

function Door({ position }) {
  return <group position={position}>
    <Block position={[0, 0.88, 0]} size={[0.78, 1.76, 0.08]} color="#68472f" />
    <Block position={[0, 0.88, 0.05]} size={[0.65, 1.62, 0.025]} color="#986d47" />
    <mesh position={[0.25, 0.8, 0.09]}><sphereGeometry args={[0.045, 12, 12]} /><meshStandardMaterial color="#dfc17b" metalness={0.6} /></mesh>
  </group>;
}

function Balcony({ width, depth, position }) {
  return <group position={position}>
    <Block position={[0, 0, depth / 2]} size={[width, 0.13, depth]} color="#d4c4a8" />
    <Block position={[0, -0.055, depth]} size={[width, 0.12, 0.09]} color="#344b42" />
    <Block position={[0, 0.49, depth]} size={[width - 0.1, 0.82, 0.035]} color="#a9d9df" roughness={0.18} />
    <Block position={[0, 0.93, depth]} size={[width, 0.065, 0.075]} color="#34433e" metalness={0.25} />
    <Block position={[0, 0.1, depth]} size={[width, 0.055, 0.065]} color="#34433e" />
    {[-1, 1].map(side => <Block key={side} position={[side * width / 2, 0.45, depth / 2]} size={[0.045, 0.76, depth]} color="#46564e" />)}
    {[-0.38, 0, 0.38].map(p => <Block key={p} position={[p * width, 0.48, depth]} size={[0.03, 0.78, 0.045]} color="#43534b" />)}
  </group>;
}

function SolarPanel({ position, rotation = [0, 0, 0] }) {
  return <group position={position} rotation={rotation}>
    <Block position={[0, 0.035, 0]} size={[0.76, 0.055, 0.58]} color="#35434d" />
    <Block position={[0, 0.068, 0]} size={[0.71, 0.018, 0.53]} color="#07518a" roughness={0.2} metalness={0.15} />
    {[-0.23, 0, 0.23].map(x => <Block key={`x${x}`} position={[x, 0.08, 0]} size={[0.012, 0.008, 0.52]} color="#9bdcf6" />)}
    {[-0.17, 0, 0.17].map(z => <Block key={`z${z}`} position={[0, 0.08, z]} size={[0.7, 0.008, 0.012]} color="#9bdcf6" />)}
  </group>;
}

function Roof({ width, depth, roofY, overhang, pitch, color, rafters = false }) {
  const halfSpan = width / 2 + overhang;
  const rise = halfSpan * Math.tan(pitch);
  const slopeLength = halfSpan / Math.cos(pitch);
  const eaveY = roofY + 0.12;
  const roofDepth = depth + overhang * 2;
  return <group>
    <Block position={[-halfSpan / 2, eaveY + rise / 2, 0]} size={[slopeLength, 0.16, roofDepth]} color={color} rotation={[0, 0, pitch]} />
    <Block position={[halfSpan / 2, eaveY + rise / 2, 0]} size={[slopeLength, 0.16, roofDepth]} color={color} rotation={[0, 0, -pitch]} />
    <Block position={[0, eaveY + rise + 0.08, 0]} size={[0.16, 0.12, roofDepth]} color="#574936" />
    {rafters && Array.from({ length: 7 }, (_, i) => {
      const z = -depth / 2 + (i / 6) * depth;
      return <group key={i}>
        <Block position={[-halfSpan / 2, eaveY + rise / 2, z]} size={[slopeLength, 0.075, 0.075]} color="#ad7c4d" rotation={[0, 0, pitch]} />
        <Block position={[halfSpan / 2, eaveY + rise / 2, z]} size={[slopeLength, 0.075, 0.075]} color="#ad7c4d" rotation={[0, 0, -pitch]} />
      </group>;
    })}
  </group>;
}

function RainwaterSystem({ width, depth, liters }) {
  const tankHeight = clamp(1.15 + liters / 8000, 1.15, 1.8);
  const x = width / 2 + 0.85;
  const z = -depth * 0.22;
  return <group>
    <mesh position={[x, tankHeight / 2 + 0.12, z]} castShadow>
      <cylinderGeometry args={[0.43, 0.43, tankHeight, 32]} />
      <meshStandardMaterial color="#1989b5" roughness={0.3} />
    </mesh>
    <Block position={[x, 0.06, z]} size={[1.02, 0.12, 1.02]} color="#6c7775" />
    <Label position={[x, tankHeight + 0.48, z]}>{`Rainwater · ${Math.round(liters)} L`}</Label>
  </group>;
}

function Plant({ position }) {
  return <group position={position}>
    <Block position={[0, 0.12, 0]} size={[1.05, 0.24, 0.65]} color="#795638" />
    {[-0.35, 0, 0.35].map((x, i) => <group key={i} position={[x, 0.25, 0]}>
      <Block position={[0, 0.16, 0]} size={[0.09, 0.35, 0.09]} color="#438451" />
      <mesh position={[0, 0.38, 0]}><sphereGeometry args={[0.19, 12, 12]} /><meshStandardMaterial color={i === 1 ? "#5b9b4d" : "#75ad61"} /></mesh>
    </group>)}
  </group>;
}

function Furniture({ position, type = "bed" }) {
  if (type === "sofa") return <group position={position}>
    <Block position={[0, 0.28, 0]} size={[1.05, 0.24, 0.44]} color="#a7b8a8" />
    <Block position={[0, 0.49, -0.17]} size={[1.05, 0.35, 0.1]} color="#82998a" />
    <Block position={[-0.49, 0.39, 0]} size={[0.09, 0.28, 0.44]} color="#82998a" />
    <Block position={[0.49, 0.39, 0]} size={[0.09, 0.28, 0.44]} color="#82998a" />
  </group>;
  if (type === "table") return <group position={position}>
    <Block position={[0, 0.48, 0]} size={[0.72, 0.07, 0.5]} color="#a17a50" />
    {[-0.28, 0.28].flatMap(x => [-0.18, 0.18].map(z => <Block key={`${x}-${z}`} position={[x, 0.24, z]} size={[0.045, 0.45, 0.045]} color="#76583b" />))}
  </group>;
  return <group position={position}>
    <Block position={[0, 0.19, 0]} size={[0.7, 0.18, 0.88]} color="#8b6848" />
    <Block position={[0, 0.31, 0]} size={[0.67, 0.12, 0.83]} color="#e7e0d1" />
    <Block position={[0, 0.39, -0.3]} size={[0.42, 0.06, 0.18]} color="#fff" />
    <Block position={[0, 0.39, -0.47]} size={[0.74, 0.4, 0.06]} color="#79583a" />
  </group>;
}

function ShelterModel({ view, parameters }) {
  const interior = view === "Interior";
  const structure = view === "Structure";
  const sustainability = view === "Sustainability";
  const climate = view === "Climate";
  const thermal = view === "Thermal";
  const area = clamp(getNumber(parameters, "floor_area_sqft", 800), 180, 5000);
  const occupants = clamp(getNumber(parameters, "occupants", 4), 1, 16);
  const bedrooms = clamp(getNumber(parameters, "bedrooms", Math.ceil(occupants / 2)), 1, 8);
  const floors = Math.round(clamp(getNumber(parameters, "floors", area >= 1200 ? 2 : 1), 1, 3));
  const temperature = getNumber(parameters, "temperature_c", 32);
  const humidity = getNumber(parameters, "humidity_percent", 62);
  const rainfall = getNumber(parameters, "rainfall_mm_year", 900);
  const solar = getNumber(parameters, "solar_radiation_kwh_m2_day", 5.2);
  const wind = getNumber(parameters, "wind_speed_kmh", 14);
  const hotClimate = temperature >= 30;
  const coldClimate = temperature <= 10;
  const humidClimate = humidity >= 70;
  const strongSolar = solar >= 5;
  const areaScale = Math.sqrt(area / 800);
  const width = clamp(4 * areaScale, 3.5, 6.2);
  const depth = clamp(3 * areaScale, 2.8, 5.1);
  const floorHeight = 2.25;
  const roofY = floors * floorHeight + 0.25;
  const overhangFt = coldClimate ? 1.2 : hotClimate || strongSolar ? 3 : 2;
  const overhang = clamp(getNumber(parameters, "roof_overhang_ft", overhangFt) * 0.22, 0.25, 0.9);
  const pitchDegrees = getNumber(parameters, "roof_pitch_degrees", rainfall >= 1500 ? 40 : rainfall >= 900 ? 30 : rainfall >= 400 ? 22 : 15);
  const pitch = clamp(pitchDegrees * Math.PI / 180, 0.12, 0.7);
  const defaultPanels = solar >= 6 ? 8 : solar >= 5 ? 6 : solar >= 3.5 ? 4 : solar >= 2.5 ? 2 : 0;
  const panels = Math.round(clamp(getNumber(parameters, "solar_panel_count", defaultPanels), 0, 8));
  const tankDefault = rainfall >= 1800 ? 6000 : rainfall >= 1200 ? 4000 : rainfall >= 700 ? 2500 : rainfall >= 350 ? 1000 : 0;
  const tank = clamp(getNumber(parameters, "rainwater_tank_liters", tankDefault), 0, 10000);
  const openings = Math.round(clamp(getNumber(parameters, "ventilation_openings", humidity >= 70 ? 5 : temperature >= 28 ? 6 : 4), 2, 8));
  const wallColor = thermal ? hotClimate ? "#e58b54" : coldClimate ? "#4d9ac5" : "#d7c8aa" : coldClimate ? "#d5dce0" : hotClimate ? "#e6d8bc" : "#e1d3b8";
  const roofColor = thermal ? hotClimate ? "#d94b36" : coldClimate ? "#397ca8" : "#6d9c82" : strongSolar ? "#9aafa0" : "#536f4e";
  const frontZ = depth / 2;
  const wallHeight = 2.12;
  const wallCenter = 1.18;
  const halfSpan = width / 2 + overhang;
  const roofRise = halfSpan * Math.tan(pitch);

  const partitions = useMemo(() => Array.from({ length: Math.min(5, bedrooms - 1) }, (_, i) => ({
    key: i, z: -depth / 2 + (i + 1) * depth / (Math.min(5, bedrooms - 1) + 1)
  })), [bedrooms, depth]);

  return <group>
    <Block position={[0, -0.18, 0]} size={[width + 2.5, 0.22, depth + 2.5]} color="#929b91" />
    <Block position={[0, -0.04, 0]} size={[width + 0.08, 0.12, depth + 0.08]} color="#c8c4b8" />

    {Array.from({ length: floors }, (_, floor) => {
      const y = floor * floorHeight;
      return <group key={floor}>
        <Block position={[0, y + 0.02, 0]} size={[width + 0.08, 0.14, depth + 0.08]} color="#bcb9ae" />
        <Block position={[0, y + 0.12, 0]} size={[width, 0.08, depth]} color="#c7b18e" />

        {!structure && <>
          <Block position={[0, y + wallCenter, -depth / 2]} size={[width, wallHeight, 0.14]} color={wallColor} />
          <Block position={[-width / 2, y + wallCenter, 0]} size={[0.14, wallHeight, depth]} color={wallColor} />
          <Block position={[width / 2, y + wallCenter, 0]} size={[0.14, wallHeight, depth]} color={wallColor} />

          {/* Modern contrasting facade band and entrance-side accent */}
          <Block position={[-width * 0.34, y + 1.18, frontZ]} size={[width * 0.32, 2.12, 0.14]} color={wallColor} />
          <Block position={[width * 0.34, y + 1.18, frontZ]} size={[width * 0.32, 2.12, 0.14]} color={wallColor} />
          <Block position={[0, y + 2.02, frontZ]} size={[width * 0.32, 0.44, 0.14]} color={wallColor} />
          <Block position={[0, y + 1.1, frontZ - 0.075]} size={[width * 0.31, 1.85, 0.08]} color={floor === 0 ? "#53685a" : "#9a7955"} />

          {floor === 0 ? <Door position={[0, y + 0.22, frontZ + 0.09]} /> : <Window position={[0, y + 1.24, frontZ + 0.09]} width={Math.min(1.15, width * 0.3)} height={0.95} />}
          <Window position={[-width * 0.31, y + 1.3, frontZ + 0.09]} width={Math.min(0.88, width * 0.22)} />
          <Window position={[width * 0.31, y + 1.3, frontZ + 0.09]} width={Math.min(0.88, width * 0.22)} />

          {[-1, 1].map(side => <Block key={side} position={[side * width * 0.31, y + 1.77, frontZ + 0.19]} size={[Math.min(1.12, width * 0.28), 0.09, 0.42]} color="#76583c" />)}
          {[-0.16, 0.16].map(offset => <Block key={offset} position={[width * offset, y + 1.08, frontZ + 0.09]} size={[0.075, 1.7, 0.08]} color="#ad8055" />)}
          {floor > 0 && <Balcony position={[0, y + 0.1, frontZ + 0.04]} width={width * 0.76} depth={0.7} />}
        </>}

        {(structure || interior) && [-1, 1].flatMap(sx => [-1, 1].map(sz =>
          <Block key={`${sx}-${sz}`} position={[sx * (width / 2 - 0.12), y + 1.18, sz * (depth / 2 - 0.12)]} size={[0.12, 2.15, 0.12]} color="#8c7354" />
        ))}

        {interior && <>
          <Block position={[0, y + 0.53, -depth * 0.04]} size={[width * 0.86, 0.82, 0.07]} color="#c7b99e" />
          {bedrooms >= 2 && <Block position={[0, y + 0.53, -depth * 0.28]} size={[0.07, 0.82, depth * 0.39]} color="#c7b99e" />}
          {partitions.map(p => <Block key={`${floor}-${p.key}`} position={[0, y + 0.95, p.z]} size={[width * 0.82, 1.7, 0.06]} color="#c7b99e" />)}
          {floor === 0 && <>
            <Furniture position={[-width * 0.26, 0.14, depth * 0.28]} type="sofa" />
            <Furniture position={[width * 0.25, 0.14, depth * 0.27]} type="table" />
            <Furniture position={[-width * 0.24, 0.14, -depth * 0.29]} type="bed" />
            {bedrooms >= 2 && <Furniture position={[width * 0.24, 0.14, -depth * 0.29]} type="bed" />}
          </>}
        </>}
      </group>;
    })}

    {!interior && !climate && !thermal && <Roof width={width} depth={depth} roofY={roofY} overhang={overhang} pitch={pitch} color={roofColor} rafters={structure} />}

    {(sustainability || view === "Exterior") && <>
      {Array.from({ length: panels }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const column = Math.floor(i / 2) % 2;
        const row = Math.floor(i / 4);
        const x = side * halfSpan * (0.45 + column * 0.22);
        const y = roofY + 0.12 + (halfSpan - Math.abs(x)) * Math.tan(pitch) + 0.13;
        const z = -depth * 0.2 + row * 0.72;
        return <SolarPanel key={i} position={[x, y, z]} rotation={[0, 0, side < 0 ? pitch : -pitch]} />;
      })}
      {sustainability && panels > 0 && <Label position={[0, roofY + roofRise + 0.55, 0]}>{`Solar array · ${panels} panel(s)`}</Label>}
      {tank > 0 && <RainwaterSystem width={width} depth={depth} liters={tank} />}
      <Plant position={[-width / 2 - 0.65, 0, frontZ + 0.25]} />
      {sustainability && <Label position={[-width / 2 - 0.45, roofY + 0.15, -depth * 0.2]}>Ventilation</Label>}
    </>}

    {climate && <>
      {Array.from({ length: openings }, (_, i) => {
        const x = -width * 0.36 + (i % 4) * width * 0.24;
        const z = frontZ + 0.12;
        const y = 0.75 + Math.floor(i / 4) * 0.5;
        return <group key={i} position={[x, y, z]}>
          <Block position={[0, 0, 0]} size={[0.42, 0.035, 0.04]} color={wind < 8 ? "#e8a94e" : wind > 35 ? "#e66b45" : "#29a9d0"} />
          <Block position={[0.18, 0.04, 0]} size={[0.08, 0.035, 0.04]} color="#29a9d0" rotation={[0, 0, -0.5]} />
        </group>;
      })}
      <Label position={[0, roofY + 0.1, frontZ + 0.5]}>{`Wind · ${wind} km/h · ${openings} vents`}</Label>
      <Label position={[0, roofY - 0.3, frontZ + 0.5]}>{humidClimate ? "High humidity: ventilation priority" : "Ventilation strategy"}</Label>
    </>}

    {thermal && <>
      <Block position={[0, floors * floorHeight / 2, -depth / 2 - 0.1]} size={[width * 0.82, floors * floorHeight * 0.72, 0.025]} color={hotClimate ? "#e56b45" : coldClimate ? "#4d9ac5" : "#72a78a"} />
      <Block position={[width / 2 + 0.11, floors * floorHeight / 2, 0]} size={[0.025, floors * floorHeight * 0.72, depth * 0.78]} color={humidClimate ? "#e7b24b" : coldClimate ? "#4d9ac5" : "#72a78a"} />
      <Label position={[0, roofY + 0.2, 0]}>{`Temperature · ${temperature}°C`}</Label>
      <Label position={[0, roofY - 0.2, 0]}>{hotClimate ? "Hot-climate shading" : coldClimate ? "Cold-climate insulation" : "Moderate-climate strategy"}</Label>
    </>}
  </group>;
}

export default function Shelter3D({ parameters = {} }) {
  const [view, setView] = useState("Exterior");
  const area = Math.round(getNumber(parameters, "floor_area_sqft", 800));
  const occupants = Math.round(clamp(getNumber(parameters, "occupants", 4), 1, 16));
  const bedrooms = Math.round(clamp(getNumber(parameters, "bedrooms", Math.ceil(occupants / 2)), 1, 8));
  const floors = Math.round(clamp(getNumber(parameters, "floors", area >= 1200 ? 2 : 1), 1, 3));
  const wind = getNumber(parameters, "wind_speed_kmh", 14);
  const temperature = getNumber(parameters, "temperature_c", 32);
  const solar = getNumber(parameters, "solar_radiation_kwh_m2_day", 5.2);
  const rainfall = getNumber(parameters, "rainfall_mm_year", 900);
  const humidity = getNumber(parameters, "humidity_percent", 62);
  const panels = Math.round(clamp(getNumber(parameters, "solar_panel_count", solar >= 6 ? 8 : solar >= 5 ? 6 : solar >= 3.5 ? 4 : solar >= 2.5 ? 2 : 0), 0, 8));
  const tank = Math.round(clamp(getNumber(parameters, "rainwater_tank_liters", rainfall >= 1800 ? 6000 : rainfall >= 1200 ? 4000 : rainfall >= 700 ? 2500 : rainfall >= 350 ? 1000 : 0), 0, 10000));
  const descriptions = {
    Exterior: "Modern climate-responsive home with balconies, a contemporary facade, sloped solar roof and rainwater collection.",
    Interior: `Illustrative cutaway layout for ${bedrooms} bedroom(s).`,
    Structure: "Conceptual columns, floor slabs and roof framing. A qualified engineer must verify all structural elements.",
    Sustainability: `Conceptual equipment: ${panels} solar panel(s), ${tank.toLocaleString()} L rainwater storage and planting.`,
    Climate: `Conceptual ventilation indicators for ${wind} km/h wind and ${humidity}% humidity. Not a CFD simulation.`,
    Thermal: `Illustrative thermal colours for ${temperature}°C. Not a validated thermal simulation.`
  };
  const interior = view === "Interior";
  const buildingHeight = floors * 2.25 + 1.2;

  return <div style={{ overflow: "hidden", borderRadius: 16, border: "1px solid #d9e2dc", background: "#edf2ee", color: "#20372d" }}>
    <div style={{ padding: 14, display: "flex", flexWrap: "wrap", gap: 8, background: "#f8faf8", borderBottom: "1px solid #d9e2dc" }}>
      {VIEWS.map(name => <button key={name} onClick={() => setView(name)} style={{ border: "1px solid", borderColor: view === name ? "#47765c" : "#d4ded6", borderRadius: 9, padding: "9px 12px", cursor: "pointer", background: view === name ? "#28553e" : "#fff", color: view === name ? "#fff" : "#365444", fontWeight: 600, fontSize: 12 }}>{name}</button>)}
    </div>
    <div style={{ height: 500, position: "relative" }}>
      <Canvas shadows camera={{ position: [7, Math.max(5.2, floors * 1.8), 9], fov: 42 }} dpr={[1, 1.75]}>
        <color attach="background" args={["#edf2ee"]} />
        <ambientLight intensity={1.05} />
        <directionalLight position={[6, 10, 7]} intensity={2.1} castShadow />
        <hemisphereLight args={["#fff7e8", "#9daf9e", 1.05]} />
        <ShelterModel view={view} parameters={parameters} />
        <gridHelper args={[20, 20, "#a8b9aa", "#d3ddd4"]} position={[0, -0.24, 0]} />
        <OrbitControls key={view} makeDefault target={[0, buildingHeight / 2, 0]} enableDamping dampingFactor={0.08} minDistance={4} maxDistance={22} maxPolarAngle={Math.PI / 2.02} />
      </Canvas>
      <div style={{ position: "absolute", left: 14, bottom: 14, padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,0.94)", border: "1px solid #d8e2d9", fontSize: 12, color: "#365444", pointerEvents: "none", lineHeight: 1.6 }}>
        <strong>{view} view</strong>
        <div>Drag to rotate · Scroll to zoom</div>
        <div>{area} sq ft · {occupants} occupant(s) · {bedrooms} bedroom(s) · {floors} floor(s), maximum 3</div>
      </div>
    </div>
    {view === "Sustainability" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 10, padding: 14, background: "#e8f1e9", borderTop: "1px solid #d9e2dc" }}>
      {[["☀️", "Solar panels", `${panels} panel(s)`], ["💧", "Rainwater storage", `${tank.toLocaleString()} L`], ["🌧️", "Annual rainfall", `${rainfall} mm/year`], ["🌬️", "Wind speed", `${wind} km/h`], ["🌡️", "Temperature", `${temperature}°C`], ["💦", "Humidity", `${humidity}%`], ["🔆", "Solar radiation", `${solar} kWh/m²/day`]].map(([icon, label, value]) => <div key={label} style={{ background: "#fff", border: "1px solid #d5e3d7", borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 21 }}>{icon}</div><div style={{ fontSize: 12, color: "#52675a", marginTop: 5 }}>{label}</div><strong style={{ fontSize: 13 }}>{value}</strong>
      </div>)}
    </div>}
    <div style={{ padding: "12px 16px", background: "#f8faf8", borderTop: "1px solid #d9e2dc", fontSize: 12, lineHeight: 1.6, color: "#52675a" }}>{descriptions[view]}</div>
  </div>;
}
