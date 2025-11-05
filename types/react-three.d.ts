/// <reference types="three" />
/// <reference types="@react-three/fiber" />

import { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

// ✅ Extend JSX namespace to allow <mesh>, <light>, etc.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      primitive?: any;
      color?: any;
      ambientLight?: any;
      directionalLight?: any;
      orthographicCamera?: any;
      mesh?: any;
      planeGeometry?: any;
      meshStandardMaterial?: any;
    }
  }
}

// ✅ Shared GLTF type
export type GLTFResult = {
  scene: THREE.Group;
  nodes?: Record<string, THREE.Object3D>;
  materials?: Record<string, THREE.Material>;
};

export {}; // keep module scoping valid
