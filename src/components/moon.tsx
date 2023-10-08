/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { deg_to_rad } from '../util/rad_deg';
import { to_xyz } from '../util/coor_convert';
import { SphereToQuads } from '../util/sphere_to_quads';

const Moon: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({antialias:true});
  let controls: OrbitControls | null = null; // Declaramos los controles como variable externa

  // Variable para controlar la posición Z de la cámara
  const cameraZPosition = 25;

  useEffect(() => {
    type station = {
      station: string,
      lat: number,
      long: number
    }
    type sm = {
      type: string,
      date:number,
      lat: number,
      long: number,
      mag: number
    }
    type ai = {
      type: string,
      year: number,
      day: number,
      h: number,
      m: number,
      s: number,
      lat: number,
      long: number,
      mag: number
    }
    type dm = {
      type: string,
      date: number,
      lat: number,
      long: number,
      depth: number
    }

    let stations: station[]
    let sm: sm[]
    let ai: ai[]
    let dm: dm[]

    const fetch_data = async () => {
      await fetch(`https://moonquakemap-2-0-backend.vercel.app/data/stations`)
        .then(res => res.json())
        .then((data) => {
          stations = data.stations
        });
      await fetch(`https://moonquakemap-2-0-backend.vercel.app/data/normal`)
        .then(res => res.json())
        .then((data) => {
          sm = data.sm
          ai = data.ai
        });
      await fetch(`https://moonquakemap-2-0-backend.vercel.app/data/dm`)
        .then(res => res.json())
        .then((data) => {
          dm = data.dm
        });
    }

    fetch_data();

    if (containerRef.current) {
      const container = containerRef.current;
      container.appendChild(renderer.domElement);

      // Configurar el tamaño del renderizador para que coincida con el tamaño de la ventana
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Cargar el modelo .glb
      const loadingManager = new THREE.LoadingManager();

      const progressBar = document.getElementById('progress-bar') as HTMLInputElement;

      loadingManager.onProgress = function(url, loaded, total){
        progressBar.value = (loaded / total * 100).toString();
      }

      const progressBarContainer = document.querySelector('.progress-bar-container') as HTMLInputElement;

      loadingManager.onLoad = function(){
        progressBarContainer.classList.add('hidden');
        setTimeout(() => {
          progressBarContainer.classList.remove('hidden');
          progressBarContainer.style.display = 'none';
        }, 2000);
      }




      const loader = new GLTFLoader(loadingManager);
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

        controls.enablePan = false;

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
        model.visible = true;
        document.getElementById("DMToggle").addEventListener("click", function () {
          model.visible = !model.visible;
        });


        // Point to the origin (0, 0).
        const originGeo = new THREE.SphereGeometry(0.1, 10, 10);
        const originMaterial = new THREE.MeshBasicMaterial({ color: 0x0077B6 });
        originMaterial.transparent = true;
        originMaterial.opacity = 1
        document.getElementById("DMToggle").addEventListener("click", function () {
          if (originMaterial.opacity == 1) {
            originMaterial.opacity = 0.2;
          } else {
            originMaterial.opacity = 1;
          }
        });
        const origin = new THREE.Mesh(originGeo, originMaterial);
        const r = 9.98
        const originPos: number[] = to_xyz(r, 0, 0);
        origin.position.set(originPos[0], originPos[1], originPos[2])
        document.getElementById("LatLongButton").addEventListener("click", function () {
          origin.visible = !origin.visible;
        });
        scene.add(origin);


        // Lat and Long mesh
        const g = new THREE.SphereGeometry(10.01, 60, 30);
        SphereToQuads(g);
        const m = new THREE.LineBasicMaterial({ color: 0x48CAE4 });
        m.transparent = true;
        m.opacity = 1;
        document.getElementById("DMToggle").addEventListener("click", function () {
          if (m.opacity == 1) {
            m.opacity = 0.1;
          } else {
            m.opacity = 1;
          }
        });
        const latLongMesh = new THREE.LineSegments(g, m);
        latLongMesh.rotateY(deg_to_rad(-90));
        latLongMesh.visible = false;
        document.getElementById("LatLongButton").addEventListener("click", function () {
          latLongMesh.visible = !latLongMesh.visible;
        });
        scene.add(latLongMesh);

        // Renders the stations.
        const stations_coors = new THREE.Group();
        for (let i = 0; i < stations.length; i++) {
          const coorGeo = new THREE.SphereGeometry(0.1, 10, 10);
          const coorMaterial = new THREE.MeshBasicMaterial({ color: 0xC1121F });
          const station_coor = new THREE.Mesh(coorGeo, coorMaterial);
          const r = 9.98
          const stationPos: number[] = to_xyz(r, stations[i].lat, stations[i].long);
          station_coor.position.set(stationPos[0], stationPos[1], stationPos[2])
          stations_coors.add(station_coor)
        }
        stations_coors.visible = false;
        document.getElementById("Stations").addEventListener("click", function () {
          stations_coors.visible = !stations_coors.visible;
        });
        scene.add(stations_coors);

        // Renders shallow moonquakes (SM) and artificial impacts (AI).
        const sm_coors = new THREE.Group();
        for (let i = 0; i < sm.length; i++) {
          const coorGeo = new THREE.SphereGeometry(0.1, 10, 10);
          const coorMaterial = new THREE.MeshBasicMaterial({ color: 0xFEAB03 });
          const sm_coor = new THREE.Mesh(coorGeo, coorMaterial);
          const r = 9.98
          const smPos: number[] = to_xyz(r, sm[i].lat, sm[i].long);
          sm_coor.position.set(smPos[0], smPos[1], smPos[2])
          sm_coors.add(sm_coor)
        }
        sm_coors.visible = true;
        document.getElementById("DMToggle").addEventListener("click", function () {
          sm_coors.visible = !sm_coors.visible;
        });
        scene.add(sm_coors);

        const ai_coors = new THREE.Group();
        for (let i = 0; i < ai.length; i++) {
          const coorGeo = new THREE.SphereGeometry(0.1, 10, 10);
          const coorMaterial = new THREE.MeshBasicMaterial({ color: 0xFB8500 });
          const ai_coor = new THREE.Mesh(coorGeo, coorMaterial);
          const r = 9.98
          const aiPos: number[] = to_xyz(r, ai[i].lat, ai[i].long);
          ai_coor.position.set(aiPos[0], aiPos[1], aiPos[2])
          ai_coors.add(ai_coor)
        }
        ai_coors.visible = true;
        document.getElementById("DMToggle").addEventListener("click", function () {
          ai_coors.visible = !ai_coors.visible;
        });
        scene.add(ai_coors);

        // Renders deep moonquakes (DM) in DM mode.
        const dm_coors = new THREE.Group();
        for (let i = 0; i < dm.length; i++) {
          const coorGeo = new THREE.SphereGeometry(0.1, 10, 10);
          const coorMaterial = new THREE.MeshBasicMaterial({ color: 0xD62828 });
          const dm_coor = new THREE.Mesh(coorGeo, coorMaterial);
          const r = (1737.4 - dm[i].depth) * 10 / 1737.4
          const dmPos: number[] = to_xyz(r, dm[i].lat, dm[i].long);
          dm_coor.position.set(dmPos[0], dmPos[1], dmPos[2])
          dm_coors.add(dm_coor)
        }
        dm_coors.visible = false;
        document.getElementById("DMToggle").addEventListener("click", function () {
          dm_coors.visible = !dm_coors.visible;
        });
        scene.add(dm_coors);

        // Renders mantle mesh
        const mantleGeo = new THREE.SphereGeometry(3.3786, 60, 30);
        SphereToQuads(mantleGeo);
        const mantleMaterial = new THREE.LineBasicMaterial({ color: 0x48CAE4 });
        mantleMaterial.transparent = true;
        mantleMaterial.opacity = 0.4;
        const mantle = new THREE.LineSegments(mantleGeo, mantleMaterial);
        mantle.rotateY(deg_to_rad(-90));
        scene.add(mantle);

        // Redners moon's nucleus in DM mode.
        const nucleusGeo = new THREE.SphereGeometry(2500/1241, 60, 60);
        const nucleusMaterial = new THREE.MeshPhysicalMaterial({ color: 0xF77F00 });
        const nucleus = new THREE.Mesh(nucleusGeo, nucleusMaterial);
        nucleus.position.set(0, 0, 0)
        nucleus.castShadow = true;
        nucleus.receiveShadow = true;
        nucleus.visible = true
        scene.add(nucleus)

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
