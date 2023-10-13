/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { sm, ai, dm, station } from '../util/types';
import { deg_to_rad } from '../util/rad_deg';
import { to_xyz } from '../util/coor_convert';
import { SphereToQuads } from '../util/sphere_to_quads';
import { info_attribute } from "../util/types";

const Moon = ({ resetDisplayInfo }: { resetDisplayInfo: Function }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  let controls: OrbitControls | null = null; // Declaramos los controles como variable externa

  // Variable para controlar la posición Z de la cámara
  const cameraZPosition = 25;

  useEffect(() => {

    let stations: station[]
    let sm: sm[]
    let ai: ai[]
    let dm: dm[]

    const fetch_data = async () => {
      console.log("FETCHED from moon.tsx")
      await fetch(`https://moonquakemap-2-0-backend.vercel.app/data/stations`)
        .then(res => res.json())
        .then((data) => {
          stations = data.stations
        });
      await fetch(`https://moonquakemap-2-0-backend.vercel.app/data/sm`)
        .then(res => res.json())
        .then((data) => {
          sm = data.sm
        });
      await fetch(`https://moonquakemap-2-0-backend.vercel.app/data/ai`)
        .then(res => res.json())
        .then((data) => {
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

      loadingManager.onProgress = function (url, loaded, total) {
        progressBar.value = (loaded / total * 100).toString();
      }

      const progressBarContainer = document.querySelector('.progress-bar-container') as HTMLInputElement;

      loadingManager.onLoad = function () {
        progressBarContainer.classList.add('hidden');
        setTimeout(() => {
          progressBarContainer.classList.remove('hidden');
          progressBarContainer.style.display = 'none';
        }, 2000);
      }




      const loader = new GLTFLoader(loadingManager);
      loader.load('/src/assets/moon.glb', (gltf) => {
        const model = gltf.scene;
        scene.add(model)

        // Configurar la cámara
        camera.position.z = cameraZPosition;

        // Configurar controles orbitales
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0); // Establece el punto hacia el que mira la cámara

        // Establecer límites de distancia de zoom
        controls.minDistance = 12; // Establece la distancia mínima
        controls.maxDistance = 50; // Establece la distancia máxima

        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.15;

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
        const originGeo = new THREE.OctahedronGeometry(0.1, 0);
        const originMaterial = new THREE.MeshBasicMaterial({ color: 0x48CAE4 });
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
        origin.visible = false;
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
        for (let i = 0; i < stations.length; i++) {
          const ori_color = 0x0065ff
          const selected_color = 0xa5c8ff
          const coorGeo = new THREE.OctahedronGeometry(0.1, 0);
          const coorMaterial = new THREE.MeshBasicMaterial({ color: ori_color });
          const station_coor = new THREE.Mesh(coorGeo, coorMaterial);
          station_coor.rotateX((-1) * deg_to_rad(stations[i].lat))
          station_coor.rotateY(deg_to_rad(stations[i].long))
          station_coor.userData.station = true
          station_coor.userData.id = stations[i].id
          station_coor.userData.mission = stations[i].mission
          station_coor.userData.startDate = stations[i].startYear.toString() + "-" + stations[i].startMonth.toString() + "-" + stations[i].startDay.toString()
          station_coor.userData.endDate = stations[i].endYear.toString() + "-" + stations[i].endMonth.toString() + "-" + stations[i].endDay.toString()
          station_coor.userData.clickable = true
          station_coor.userData.ori_color = ori_color
          station_coor.userData.selected_color = selected_color
          const r = 10.05
          station_coor.userData.r = r
          station_coor.userData.lat = stations[i].lat
          station_coor.userData.long = stations[i].long
          const stationPos: number[] = to_xyz(r, stations[i].lat, stations[i].long);
          station_coor.userData.x = stationPos[0]
          station_coor.userData.y = stationPos[1]
          station_coor.userData.z = stationPos[2]
          station_coor.position.set(stationPos[0], stationPos[1], stationPos[2])
          // stations_coors.add(station_coor)
          scene.add(station_coor)
          station_coor.visible = false
        }
        document.getElementById("Stations").addEventListener("click", function () {
          for (const child of scene.children) {
            if (child.userData.station) { child.visible = !child.visible }
          }
        });

        // Renders shallow moonquakes (SM) and artificial impacts (AI).
        for (let i = 0; i < sm.length; i++) {
          const ori_color = 0xFEAB03
          const selected_color = 0xffe6b3
          const coorGeo = new THREE.OctahedronGeometry(0.1, 0);
          const coorMaterial = new THREE.MeshBasicMaterial({ color: ori_color });
          const sm_coor = new THREE.Mesh(coorGeo, coorMaterial);
          sm_coor.userData.sm = true
          sm_coor.userData.id = sm[i].id
          sm_coor.userData.type = sm[i].type
          sm_coor.userData.date = sm[i].year.toString() + "-" + sm[i].month.toString() + "-" + sm[i].day.toString() + "  " + sm[i].h.toString() + ":" + sm[i].m.toString() + ":" + sm[i].s.toString()
          sm_coor.userData.mag = sm[i].mag
          sm_coor.userData.clickable = true
          sm_coor.userData.ori_color = ori_color
          sm_coor.userData.selected_color = selected_color
          const r = 10.05
          sm_coor.userData.r = r
          sm_coor.userData.lat = sm[i].lat
          sm_coor.userData.long = sm[i].long
          const smPos: number[] = to_xyz(r, sm[i].lat, sm[i].long);
          sm_coor.userData.x = smPos[0]
          sm_coor.userData.y = smPos[1]
          sm_coor.userData.z = smPos[2]
          sm_coor.position.set(smPos[0], smPos[1], smPos[2])
          sm_coor.rotateY(deg_to_rad(sm[i].long))
          sm_coor.rotateX((-1) * deg_to_rad(sm[i].lat))
          scene.add(sm_coor)
          sm_coor.visible = false
        }
        document.getElementById("SMToggle").addEventListener("click", function () {
          for (const child of scene.children) {
            if (child.userData.sm) { child.visible = !child.visible }
          }
        });

        for (let i = 0; i < ai.length; i++) {
          const ori_color = 0xFB8500
          const selected_color = 0xffd6a9
          const coorGeo = new THREE.OctahedronGeometry(0.1, 0);
          const coorMaterial = new THREE.MeshBasicMaterial({ color: ori_color });
          const ai_coor = new THREE.Mesh(coorGeo, coorMaterial);
          ai_coor.userData.ai = true
          ai_coor.userData.id = ai[i].id
          ai_coor.userData.type = ai[i].type
          ai_coor.userData.date = ai[i].year.toString() + "-" + ai[i].month.toString() + "-" + ai[i].day.toString() + "  " + ai[i].h.toString() + ":" + ai[i].m.toString() + ":" + ai[i].s.toString()
          ai_coor.userData.mag = ai[i].mag
          ai_coor.userData.clickable = true
          ai_coor.userData.ori_color = ori_color
          ai_coor.userData.selected_color = selected_color
          const r = 10.05
          ai_coor.userData.r = r
          ai_coor.userData.lat = ai[i].lat
          ai_coor.userData.long = ai[i].long
          ai_coor.rotateY(deg_to_rad(ai[i].long))
          ai_coor.rotateX((-1) * deg_to_rad(ai[i].lat))
          const aiPos: number[] = to_xyz(r, ai[i].lat, ai[i].long);
          ai_coor.userData.x = aiPos[0]
          ai_coor.userData.y = aiPos[1]
          ai_coor.userData.z = aiPos[2]
          ai_coor.position.set(aiPos[0], aiPos[1], aiPos[2])
          scene.add(ai_coor)
          ai_coor.visible = false
        }
        document.getElementById("AIToggle").addEventListener("click", function () {
          for (const child of scene.children) {
            if (child.userData.ai) { child.visible = !child.visible }
          }
        });

        // Renders deep moonquakes (DM) in DM mode.
        for (let i = 0; i < dm.length; i++) {
          const ori_color = 0xcb1111
          const selected_color = 0xf9bbbb
          const coorGeo = new THREE.OctahedronGeometry(0.1, 0);
          const coorMaterial = new THREE.MeshBasicMaterial({ color: ori_color });
          const dm_coor = new THREE.Mesh(coorGeo, coorMaterial);
          dm_coor.userData.dm = true
          dm_coor.userData.id = dm[i].id
          dm_coor.userData.type = dm[i].type
          dm_coor.userData.date = dm[i].year.toString() + "-" + dm[i].month.toString() + "-" + dm[i].day.toString() + "  " + dm[i].h.toString() + ":" + dm[i].m.toString() + ":" + dm[i].s.toString()
          dm_coor.userData.depth = dm[i].depth
          dm_coor.userData.clickable = true
          dm_coor.userData.ori_color = ori_color
          dm_coor.userData.selected_color = selected_color
          const r = (1737.4 - dm[i].depth) * 10 / 1737.4
          dm_coor.userData.r = r
          dm_coor.userData.lat = dm[i].lat
          dm_coor.userData.long = dm[i].long
          dm_coor.rotateY(deg_to_rad(dm[i].long))
          dm_coor.rotateX((-1) * deg_to_rad(dm[i].lat))
          const dmPos: number[] = to_xyz(r, dm[i].lat, dm[i].long);
          dm_coor.userData.x = dmPos[0]
          dm_coor.userData.y = dmPos[1]
          dm_coor.userData.z = dmPos[2]
          dm_coor.position.set(dmPos[0], dmPos[1], dmPos[2])
          scene.add(dm_coor)
          dm_coor.visible = false
        }
        document.getElementById("DMToggle").addEventListener("click", function () {
          for (const child of scene.children) {
            if (child.userData.dm) { child.visible = !child.visible }
          }
        });

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
        const nucleusGeo = new THREE.SphereGeometry(2500 / 1241, 60, 60);
        const nucleusMaterial = new THREE.MeshPhysicalMaterial({ color: 0xF77F00 });
        const nucleus = new THREE.Mesh(nucleusGeo, nucleusMaterial);
        nucleus.position.set(0, 0, 0)
        nucleus.castShadow = true;
        nucleus.receiveShadow = true;
        nucleus.visible = true
        scene.add(nucleus)

        // Actualizar los controles
        controls.update();

        // TEST
        // const testGeo = new THREE.OctahedronGeometry(1, 0);
        // const testMaterial = new THREE.MeshBasicMaterial({ color: 0xD62828 });
        // const test = new THREE.Mesh(testGeo, testMaterial);
        // const testRad = 10.5
        // const testLat = 0
        // const testLong = 0
        // test.rotateY(deg_to_rad(testLong))
        // test.rotateX((-1) * deg_to_rad(testLat))
        // const testPos: number[] = to_xyz(testRad, testLat, testLong);
        // test.position.set(testPos[0], testPos[1], testPos[2])
        // scene.add(test)
        // test.userData.clickable = true;
        // test.userData.name = 'TEST';


        // Selector ring
        const ringGeo = new THREE.RingGeometry(0.13, 0.2, 20, 1);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const selector_ring = new THREE.Mesh(ringGeo, ringMaterial);
        selector_ring.position.set(0, 0, 0)
        selector_ring.userData.lat = 0
        selector_ring.userData.long = 0
        scene.add(selector_ring);
        selector_ring.visible = false

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        window.addEventListener('click', event => {
          pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
          pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

          raycaster.setFromCamera(pointer, camera)
          const intersections = raycaster.intersectObjects(scene.children)
          const clickIntersections = intersections.filter(intersect => intersect.object.userData.clickable)

          if (clickIntersections.length !== 0) {
            if (clickIntersections[0].object.userData.station) {
              resetDisplayInfo("station", clickIntersections[0].object.userData.id)
            } else if (clickIntersections[0].object.userData.sm) {
              resetDisplayInfo("sm", clickIntersections[0].object.userData.id)
            } else if (clickIntersections[0].object.userData.ai) {
              resetDisplayInfo("ai", clickIntersections[0].object.userData.id)
            } else if (clickIntersections[0].object.userData.dm) {
              resetDisplayInfo("dm", clickIntersections[0].object.userData.id)

            }

            for (const child of scene.children) {
              child.userData.clickable ? child.material.color.set(child.userData.ori_color) : null
            }

            clickIntersections[0].object.userData.clickable ? clickIntersections[0].object.material.color.set(clickIntersections[0].object.userData.selected_color) : null

            selector_ring.visible = true

            selector_ring.position.set(clickIntersections[0].object.userData.x, clickIntersections[0].object.userData.y, clickIntersections[0].object.userData.z)
            selector_ring.material.color.set(clickIntersections[0].object.userData.ori_color)

            selector_ring.rotateX(deg_to_rad(selector_ring.userData.lat))
            selector_ring.rotateY((-1) * deg_to_rad(selector_ring.userData.long))

            const lat = clickIntersections[0].object.userData.lat
            const long = clickIntersections[0].object.userData.long

            selector_ring.userData.lat = lat
            selector_ring.userData.long = long

            selector_ring.rotateY(deg_to_rad(long))
            selector_ring.rotateX((-1) * deg_to_rad(lat))
          }

          console.log(clickIntersections)

        })


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
