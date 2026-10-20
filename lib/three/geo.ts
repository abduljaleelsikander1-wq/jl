import * as THREE from "three";

/** Converts latitude/longitude (degrees) to a point on a sphere of the given radius. */
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

/**
 * Builds a great-circle arc between two lat/lon points, lifted off the sphere surface
 * so it reads as a glowing flight path rather than a seam on the globe.
 */
export function greatCircleArc(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius: number,
  segments = 64,
  liftFactor = 0.28
): THREE.Vector3[] {
  const start = latLonToVector3(lat1, lon1, radius);
  const end = latLonToVector3(lat2, lon2, radius);
  const points: THREE.Vector3[] = [];
  const angle = start.angleTo(end);
  const liftMax = radius * liftFactor * Math.min(1, angle / 1.4);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3().copy(start).lerp(end, t).normalize();
    const lift = Math.sin(Math.PI * t) * liftMax;
    point.multiplyScalar(radius + lift);
    points.push(point);
  }
  return points;
}

export function arcCurve(points: THREE.Vector3[]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.2);
}
