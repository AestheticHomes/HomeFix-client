"use client";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { usePlanner } from "./store/plannerStore";

const rad = (d)=>THREE.MathUtils.degToRad(d);

function extrudeFromWalls(walls, height=2500) {
  // Build 4cm thick walls via thin boxes per segment; floor plane from polygon bbox
  const segments = walls.map(w => {
    const dx = w.b[0]-w.a[0], dy = w.b[1]-w.a[1];
    const len = Math.hypot(dx,dy);
    const cx = (w.a[0]+w.b[0])/2, cy = (w.a[1]+w.b[1])/2;
    const rot = Math.atan2(dy, dx);
    return { pos:[cx/1000, height/2000, cy/1000], len:len/1000, rot };
  });
  return segments;
}

function AutoHideFrontWall({ segments }) {
  // Hide the wall whose outward normal faces the camera by > 0.55 dot
  const refGroup = useRef();
  const [camera, setCamera] = useState(null);
  return (
    <group ref={refGroup}>
      {segments.map((s, i) => {
        const n = new THREE.Vector3(Math.sin(s.rot), 0, -Math.cos(s.rot)); // outward
        let visible = true;
        if (camera) {
          const toCam = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3(s.pos[0], 1.2, s.pos[2])).normalize();
          visible = n.dot(toCam) < 0.55; // hide if facing camera strongly
        }
        return (
          <mesh key={i} position={[s.pos[0], 1.25, s.pos[2]]} rotation={[0, -s.rot, 0]} visible={visible} castShadow>
            <boxGeometry args={[0.04, 2.5, s.len]} />
            <meshStandardMaterial color="#cbd5e1"/>
          </mesh>
        );
      })}
      {/* capture camera */}
      <primitive object={{}} attach={null} />
      <CameraTap onReady={setCamera}/>
    </group>
  );
}
function CameraTap({ onReady }) {
  return <OrbitControls makeDefault onChange={(e)=>onReady(e.object.object)} enablePan enableZoom maxPolarAngle={rad(80)} minPolarAngle={rad(5)} />;
}

function Catalog({ onAdd }) {
  const Button = ({label,onClick})=>(
    <button onClick={onClick} className="block w-full text-left px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm">{label}</button>
  );
  return (
    <aside className="absolute top-3 left-3 z-20 w-60 p-3 rounded-xl bg-white/90 dark:bg-slate-900/80 backdrop-blur border shadow">
      <div className="font-medium mb-2">Catalog</div>
      <div className="grid gap-2">
        <Button label="+ Base unit 60x60" onClick={()=>onAdd({type:"base", size:[0.6,0.75,0.6]})}/>
        <Button label="+ Wall unit 60x40" onClick={()=>onAdd({type:"wall", size:[0.6,0.75,0.4], wallHeight:1.5})}/>
        <Button label="+ Stove 60x60" onClick={()=>onAdd({type:"stove", size:[0.6,0.9,0.6]})}/>
        <Button label="+ Chair" onClick={()=>onAdd({type:"chair", size:[0.5,0.9,0.5]})}/>
      </div>
    </aside>
  );
}

function Item({ it, onChange, wallsBBox }) {
  const ref = useRef();
  // Auto-snap: base units to y=0.45, wall units to y=wallHeight else floor
  const y = it.type==="wall" ? (it.wallHeight ?? 1.5) : (it.type==="stove"?0.45:0.45);
  const onPointerUp = () => {
    if(!ref.current) return;
    const { x, z, y:yy } = ref.current.position;
    // clamp to room bbox
    const [minX,minZ,maxX,maxZ] = wallsBBox;
    const nx = Math.min(maxX-0.3, Math.max(minX+0.3, x));
    const nz = Math.min(maxZ-0.3, Math.max(minZ+0.3, z));
    onChange({ position:[nx, yy, nz] });
  };
  return (
    <mesh ref={ref} position={it.position} onPointerUp={onPointerUp} castShadow>
      <boxGeometry args={it.size}/>
      <meshStandardMaterial color="#9ca3af"/>
    </mesh>
  );
}

export default function RoomPlanner3D({ onSummary }) {
  const { walls, items, addItem, updateItem } = usePlanner();

  const segments = useMemo(()=>extrudeFromWalls(walls, 2500), [walls]);
  const bbox = useMemo(()=>{
    const xs = walls.flatMap(w=>[w.a[0], w.b[0]]), ys = walls.flatMap(w=>[w.a[1], w.b[1]]);
    const minX = Math.min(...xs)/1000, maxX = Math.max(...xs)/1000;
    const minZ = Math.min(...ys)/1000, maxZ = Math.max(...ys)/1000;
    return [minX,minZ,maxX,maxZ];
  }, [walls]);

  return (
    <div className="relative h-[78vh] rounded-xl border bg-white dark:bg-slate-900 overflow-hidden">
      <Catalog onAdd={(proto)=>addItem({ ...proto, id: undefined, position:[0, proto.type==="wall"? (proto.wallHeight??1.5) : 0.45, 0] })} />
      <button onClick={onSummary} className="absolute top-3 right-3 z-20 px-3 py-2 rounded-lg bg-[#9B5CF8] text-white shadow">Continue</button>

      <Canvas shadows camera={{ position:[3.8, 3.6, 3.4], fov:50 }}>
        <color attach="background" args={["#f8fafc"]}/>
        <ambientLight intensity={0.65}/>
        <directionalLight castShadow position={[6,8,4]} intensity={1.1}/>
        {/* Floor (flat, 0° grid) */}
        <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
          <planeGeometry args={[100, 100]}/>
          <meshStandardMaterial color="#f1f5f9"/>
        </mesh>
        <Grid position={[0,0.002,0]} rotation={[-Math.PI/2,0,0]} cellSize={0.5} sectionSize={5} fadeDistance={40}/>
        {/* Walls with front auto-hidden */}
        <AutoHideFrontWall segments={segments}/>
        {/* Items */}
        {items.map(it=>(
          <Item key={it.id} it={it} onChange={(p)=>updateItem(it.id, p)} wallsBBox={bbox}/>
        ))}
      </Canvas>
    </div>
  );
}
