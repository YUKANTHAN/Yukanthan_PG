import * as THREE from "three";

export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (x: number, y: number) => void,
  reference?: { x: number; y: number }
) => {
  applyPointerPosition(
    event.clientX,
    event.clientY,
    setMousePosition,
    reference
  );
};

export const handleTouchMove = (
  event: TouchEvent,
  setMousePosition: (x: number, y: number) => void,
  reference?: { x: number; y: number }
) => {
  const touch = event.touches[0];
  if (!touch) return;
  applyPointerPosition(touch.clientX, touch.clientY, setMousePosition, reference);
};

const applyPointerPosition = (
  clientX: number,
  clientY: number,
  setMousePosition: (x: number, y: number) => void,
  reference?: { x: number; y: number }
) => {
  const centerX = reference ? reference.x : window.innerWidth / 2;
  const centerY = reference ? reference.y : window.innerHeight / 2;
  const rawX = (clientX - centerX) / (window.innerWidth / 2);
  const rawY = -((clientY - centerY) / (window.innerHeight / 2));
  const mouseX = Math.max(-1, Math.min(1, rawX));
  const mouseY = Math.max(-1, Math.min(1, rawY));
  setMousePosition(mouseX, mouseY);
};

export const handleTouchEnd = (
  setMousePosition: (
    x: number,
    y: number,
    interpolationX: number,
    interpolationY: number
  ) => void
) => {
  setTimeout(() => {
    setMousePosition(0, 0, 0.03, 0.03);
    setTimeout(() => {
      setMousePosition(0, 0, 0.1, 0.2);
    }, 1000);
  }, 2000);
};

export const handleHeadRotation = (
  headBone: THREE.Object3D,
  mouseX: number,
  mouseY: number,
  interpolationX: number,
  interpolationY: number,
  lerp: (x: number, y: number, t: number) => number
) => {
  if (!headBone) return;
  if (window.scrollY < 200) {
    const maxRotation = Math.PI / 6;
    headBone.rotation.y = lerp(
      headBone.rotation.y,
      mouseX * maxRotation,
      interpolationY
    );
    const minRotationX = -0.3;
    const maxRotationX = 0.4;
    if (mouseY > minRotationX) {
      if (mouseY < maxRotationX) {
        headBone.rotation.x = lerp(
          headBone.rotation.x,
          -mouseY - 0.5 * maxRotation,
          interpolationX
        );
      } else {
        headBone.rotation.x = lerp(
          headBone.rotation.x,
          -maxRotation - 0.5 * maxRotation,
          interpolationX
        );
      }
    } else {
      headBone.rotation.x = lerp(
        headBone.rotation.x,
        -minRotationX - 0.5 * maxRotation,
        interpolationX
      );
    }
  } else {
    if (window.innerWidth > 1024) {
      headBone.rotation.x = lerp(headBone.rotation.x, -0.4, 0.03);
      headBone.rotation.y = lerp(headBone.rotation.y, -0.3, 0.03);
    }
  }
};
