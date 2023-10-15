import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const Apollo15: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 200 / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  let controls: OrbitControls | null = null; // Declaramos los controles como variable externa

  // Variable para controlar la posición Z de la cámara
  const cameraZPosition = 10;

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.appendChild(renderer.domElement);

      // Configurar el tamaño del renderizador para que coincida con el ancho deseado y el alto de la ventana
      renderer.setSize(300, 300 ); // Establece el ancho y alto deseado del lienzo de renderizado

      const loader = new GLTFLoader();
      loader.load('/src/assets/apollo15.glb', (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Configurar la escala del modelo para hacerlo más pequeño (aproximadamente 100px)
        model.scale.set(1, 1, 1);

        // Configurar la cámara
        camera.position.z = cameraZPosition;
        camera.position.y = 7;

        // Ajustar la relación de aspecto de la cámara para que coincida con el nuevo tamaño del lienzo
        camera.aspect = 1; // Relación de aspecto 1:1 para mantener la proporción
        camera.updateProjectionMatrix();

        // Configurar controles orbitales
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0); // Establece el punto hacia el que mira la cámara

        // Establecer límites de distancia de zoom
        controls.minDistance = 12; // Establece la distancia mínima
        controls.maxDistance = 50; // Establece la distancia máxima

        controls.enablePan = false;

        // Actualizar los controles
        controls.update();

        // Renderizar la escena
        const animate = () => {
          // Ajustar el tamaño del renderizador en cada cuadro para que coincida con el ancho deseado y el alto deseado
          renderer.setSize(300, 300);

          requestAnimationFrame(animate);

          // Rotar el modelo de izquierda a derecha
          if (model) {
            model.rotation.y += 0.001; // Ajusta la velocidad de rotación según lo deseado
          }

          if (controls) {
            controls.update(); // Actualizar los controles en cada cuadro
          }

          renderer.render(scene, camera);
        };

        animate();
      });

      // Limpiar el controlador de eventos cuando el componente se desmonte
      return () => {
        if (controls) {
          controls.dispose();
        }
      };
    }
  }, []);

  return <div ref={containerRef}></div>;
};

export default Apollo15;