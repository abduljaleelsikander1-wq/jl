import * as THREE from "three";
import { latLonToVector3 } from "./geo";

/** Shared constants tying the globe scene and the Dubai miniature-world scene together. */
export const GLOBE_R = 2.4;
export const DUBAI_LAT = 25.2048;
export const DUBAI_LON = 55.2708;
export const ABU_DHABI_LAT = 24.4539;
export const ABU_DHABI_LON = 54.3773;

/**
 * The Dubai miniature-world group floats just beyond the globe's surface at Dubai's
 * lat/lon, oriented so its local +Y axis points outward along the globe's surface
 * normal there — i.e. objects built "upright" in local space stand correctly on that
 * point of the globe. Computed once; the camera path and the Dubai scene component both
 * use this so the hand-off between the globe and the miniature world stays geometrically
 * consistent with no runtime per-frame matrix work.
 */
export function getDubaiWorldFrame() {
  const surfacePoint = latLonToVector3(DUBAI_LAT, DUBAI_LON, GLOBE_R);
  const dir = surfacePoint.clone().normalize();
  const position = dir.clone().multiplyScalar(GLOBE_R + 2.6);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return { position, quaternion, scale: 1, dir };
}

export function localToDubaiWorld(local: [number, number, number]): THREE.Vector3 {
  const { position, quaternion, scale } = getDubaiWorldFrame();
  return new THREE.Vector3(...local).multiplyScalar(scale).applyQuaternion(quaternion).add(position);
}
