/// <reference types="three" />
/// <reference types="@react-three/fiber" />

import { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

// ✅ Extend JSX namespace to allow <mesh>, <light>, etc.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
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
