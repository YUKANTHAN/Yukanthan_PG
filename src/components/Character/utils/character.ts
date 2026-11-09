import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const handleLoaded = (gltf: GLTF): GLTF => {
    const character = gltf.scene;
    character.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = true;
        if (child.material && !Array.isArray(child.material)) {
          child.material.precision = "mediump";
        }
      }
    });
    (async () => {
      try {
        await renderer.compileAsync(character, camera, scene);
      } catch (err) {
        console.warn("compileAsync failed:", err);
      }
    })();
    try {
      setCharTimeline(character, camera);
      setAllTimeline();
      character.getObjectByName("footR")!.position.y = 3.36;
      character.getObjectByName("footL")!.position.y = 3.36;
    } catch (err) {
      console.warn("Character setup failed:", err);
    }
    dracoLoader.dispose();
    return gltf;
  };

  const loadFrom = (url: string): Promise<GLTF> =>
    new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(handleLoaded(gltf)),
        undefined,
        (error) => {
          console.error("Error loading GLTF model:", error);
          reject(error);
        }
      );
    });

  const loadCharacter = async (): Promise<GLTF | null> => {
    try {
      const encryptedData = await decryptFile(
        "/models/character.enc",
        "Character3D#@"
      );
      const blobUrl = URL.createObjectURL(new Blob([encryptedData]));
      return await loadFrom(blobUrl);
    } catch (err) {
      console.warn(
        "Encrypted character failed to load, falling back to plain model:",
        err
      );
      return await loadFrom("/models/character.glb");
    }
  };

  return { loadCharacter };
};

export default setCharacter;
