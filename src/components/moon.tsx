import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { deg_to_rad } from '../util/rad_deg';
import { get_x, get_y, get_z } from '../util/coor_convert';
import { SphereToQuads } from '../util/sphere_to_quads';

const Moon: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  let controls: OrbitControls | null = null; // Declaramos los controles como variable externa

  // Variable para controlar la posición Z de la cámara
  const cameraZPosition = 25;

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.appendChild(renderer.domElement);

      // Configurar el tamaño del renderizador para que coincida con el tamaño de la ventana
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Cargar el modelo .glb
      const loader = new GLTFLoader();
      loader.load('/src/assets/moon.glb', (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Configurar la cámara
        camera.position.z = cameraZPosition;

        // Configurar controles orbitales
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0); // Establece el punto hacia el que mira la cámara

        // Establecer límites de distancia de zoom
        controls.minDistance = 12; // Establece la distancia mínima
        controls.maxDistance = 50; // Establece la distancia máxima

        // Agregar una luz direccional con sombras
        const directionalLight = new THREE.DirectionalLight(0xffffff, 8); // Color blanco y intensidad
        directionalLight.position.set(0, 0, 40)// Posición de la luz
        directionalLight.castShadow = true; // Habilitar sombras
        scene.add(directionalLight);

        // Configurar sombras en el renderizador
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de sombra suave

        // Configurar sombras en el modelo (asegúrate de que tu modelo tenga propiedades de sombra adecuadas)
        model.castShadow = true;
        model.receiveShadow = true;
        // This sets the model with the prime meridian ofthe moon at the origin.
        model.rotateY(deg_to_rad(-90));



        // Point to the origin (0, 0).
        const originGeo = new THREE.SphereGeometry(0.1, 10, 10);
        const originMaterial = new THREE.MeshBasicMaterial({ color: 0x0077B6 });
        const origin = new THREE.Mesh(originGeo, originMaterial);
        const r = 9.98
        origin.position.set(get_x(r, 0, 0), get_y(r, 0, 0), get_z(r, 0))
        scene.add(origin);


        // Lat and Long mesh
        const g = new THREE.SphereGeometry(10.01, 60, 30);
        SphereToQuads(g);
        console.log(g);
        const m = new THREE.LineBasicMaterial({ color: 0x48CAE4 });
        m.transparent = true;
        m.opacity = 1
        const latLongMesh = new THREE.LineSegments(g, m);
        latLongMesh.rotateY(deg_to_rad(-90));
        scene.add(latLongMesh);



        // Actualizar los controles
        controls.update();

        // Renderizar la escena
        const animate = () => {
          // Ajustar el tamaño del renderizador en cada cuadro para que coincida con el tamaño de la ventana
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);

          requestAnimationFrame(animate);

          // Rotar el modelo
          if (controls) {
            controls.update(); // Actualizar los controles en cada cuadro
          }

          // model.rotation.y += 0.001;

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

export default Moon;
