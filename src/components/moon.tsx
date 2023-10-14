/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

import { sm, ai, dm, station } from '../util/types';
import { deg_to_rad } from '../util/rad_deg';
import { to_xyz } from '../util/coor_convert';
import { SphereToQuads } from '../util/sphere_to_quads';
import { info_attribute } from "../util/types";
import "./moon.css"
import { mx_fractal_noise_vec4 } from 'three/examples/jsm/nodes/Nodes.js';

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
        document.getElementById("RotationButton").addEventListener("click", function () {
          controls.autoRotate = !controls.autoRotate;
        });
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
        const g = new THREE.SphereGeometry(10.01, 72, 36);
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
        let dmVisible = false

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
          dmVisible = !dmVisible
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


        // Setting the label renderer
        const labelRenderer = new CSS2DRenderer()
        labelRenderer.setSize(window.innerWidth, window.innerHeight)
        labelRenderer.domElement.style.position = 'absolute'
        labelRenderer.domElement.style.top = '0px'
        labelRenderer.domElement.style.pointerEvents = 'none'
        document.body.appendChild(labelRenderer.domElement)

        // Labels for lat and long
        let latLongVisible = false
        const center = new THREE.Vector3(0,0,0)

        document.getElementById("LatLongLabelsButton").addEventListener("click", function () {
          latLongVisible = !latLongVisible
        })

        const checkLabelVisibility = (label, isVisible) => {
          if (isVisible) {
            if (label.userData.label) {
              const vec = new THREE.Vector3()
              const max_dist: number = (0.85) * Math.sqrt(100 + Math.pow(camera.position.distanceTo(center), 2))
              const dist = camera.position.distanceTo(label.getWorldPosition(vec))
              if (dist >= max_dist) {
                label.visible = false;
              } else {
                label.visible = true;
              }
            }
          } else {
            if (label.userData.label) {
              label.visible = false
            }
          }
        }
        
        const labels: CSS2DObject[] = []
        for (let i = 0; i < 6; i++) {
          const lat = 15 * (i + 1)

          const pN = document.createElement('p')
          pN.textContent = `${lat} N`

          const divN = document.createElement('div')
          divN.appendChild(pN)
          pN.className = "latLongLabelP"
          divN.className = "latLongLabelDiv"
          const latNLabel = new CSS2DObject(divN)
          scene.add(latNLabel)
          let labelR = 10.1
          let labelLat = lat
          let labelLong = 0
          let latLabelPos = to_xyz(labelR, labelLat, labelLong)
          latNLabel.position.set(latLabelPos[0], latLabelPos[1], latLabelPos[2])
          latNLabel.userData.label = true
          latNLabel.userData.labelLatLong = true
          labels.push(latNLabel)
          latNLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(latNLabel, latLongVisible)
          })
          document.getElementById("LatLongLabelsButton").addEventListener("click", async () => {
            checkLabelVisibility(latNLabel, latLongVisible)
          })

          const pN2 = document.createElement('p')
          pN2.textContent = `${lat} N`

          const divN2 = document.createElement('div')
          divN2.appendChild(pN2)
          pN2.className = "latLongLabelP"
          divN2.className = "latLongLabelDiv"
          const latN2Label = new CSS2DObject(divN2)
          scene.add(latN2Label)
          labelLong = 180
          latLabelPos = to_xyz(labelR, labelLat, labelLong)
          latN2Label.position.set(latLabelPos[0], latLabelPos[1], latLabelPos[2])
          latN2Label.userData.label = true
          latN2Label.userData.labelLatLong = true
          latN2Label.visible = false
          labels.push(latN2Label)
          latN2Label.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(latN2Label, latLongVisible)
          })
          document.getElementById("LatLongLabelsButton").addEventListener("click", async () => {
            checkLabelVisibility(latN2Label, latLongVisible)
          })


          const pS = document.createElement('p')
          pS.textContent = `${lat} S`

          const divS = document.createElement('div')
          divS.appendChild(pS)
          pS.className = "latLongLabelP"
          divS.className = "latLongLabelDiv"
          const latSLabel = new CSS2DObject(divS)
          scene.add(latSLabel)
          labelR = 10.1
          labelLat = lat * (-1)
          labelLong = 0
          latLabelPos = to_xyz(labelR, labelLat, labelLong)
          latSLabel.position.set(latLabelPos[0], latLabelPos[1], latLabelPos[2])
          latSLabel.userData.label = true
          latSLabel.userData.labelLatLong = true
          labels.push(latSLabel)
          latSLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(latSLabel, latLongVisible)
          })
          document.getElementById("LatLongLabelsButton").addEventListener("click", async () => {
            checkLabelVisibility(latSLabel, latLongVisible)
          })


          const pS2 = document.createElement('p')
          pS2.textContent = `${lat} S`

          const divS2 = document.createElement('div')
          divS2.appendChild(pS2)
          pS2.className = "latLongLabelP"
          divS2.className = "latLongLabelDiv"
          const latS2Label = new CSS2DObject(divS2)
          scene.add(latS2Label)
          labelLong = 180
          latLabelPos = to_xyz(labelR, labelLat, labelLong)
          latS2Label.position.set(latLabelPos[0], latLabelPos[1], latLabelPos[2])
          latS2Label.userData.label = true
          latS2Label.userData.labelLatLong = true
          latS2Label.visible = false
          labels.push(latS2Label)
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(latS2Label, latLongVisible)
          })
          document.getElementById("LatLongLabelsButton").addEventListener("click", async () => {
            checkLabelVisibility(latS2Label, latLongVisible)
          })
        }

        for (let i = 0; i < 8; i++) {
          const long = 20 * (i + 1)

          const pE = document.createElement('p')
          pE.textContent = `${long} E`

          const divE = document.createElement('div')
          divE.appendChild(pE)
          pE.className = "latLongLabelP"
          divE.className = "latLongLabelDiv"
          const longELabel = new CSS2DObject(divE)
          scene.add(longELabel)
          let labelR = 10.1
          let labelLat = 0
          let labelLong = long
          let longLabelPos = to_xyz(labelR, labelLat, labelLong)
          longELabel.position.set(longLabelPos[0], longLabelPos[1], longLabelPos[2])
          longELabel.userData.label = true
          longELabel.userData.labelLatLong = true
          labels.push(longELabel)
          longELabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(longELabel, latLongVisible)
          })
          document.getElementById("LatLongLabelsButton").addEventListener("click", async () => {
            checkLabelVisibility(longELabel, latLongVisible)
          })

          const pW = document.createElement('p')
          pW.textContent = `${long} W`

          const divW = document.createElement('div')
          divW.appendChild(pW)
          pW.className = "latLongLabelP"
          divW.className = "latLongLabelDiv"
          const longWLabel = new CSS2DObject(divW)
          scene.add(longWLabel)
          labelR = 10.1
          labelLat = 0
          labelLong = long * (-1)
          longLabelPos = to_xyz(labelR, labelLat, labelLong)
          longWLabel.position.set(longLabelPos[0], longLabelPos[1], longLabelPos[2])
          longWLabel.userData.label = true
          longWLabel.userData.labelLatLong = true
          labels.push(longWLabel)
          longWLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(longWLabel, latLongVisible)
          })
          document.getElementById("LatLongLabelsButton").addEventListener("click", async () => {
            checkLabelVisibility(longWLabel, latLongVisible)
          })
        }

        const long180 = document.createElement('p')
        long180.textContent = `180° E/W`

        const div180 = document.createElement('div')
        div180.appendChild(long180)
        long180.className = "latLongLabelP"
        div180.className = "latLongLabelDiv"
        const label180 = new CSS2DObject(div180)
        scene.add(label180)
        const label180R = 10.1
        const label180Lat = 0
        const label180Long = 180
        const label180Pos = to_xyz(label180R, label180Lat, label180Long)
        label180.position.set(label180Pos[0], label180Pos[1], label180Pos[2])
        label180.userData.label = true
        label180.userData.labelLatLong = true
        labels.push(label180)
        label180.visible = false
        window.addEventListener('mouseup', async () => {
          checkLabelVisibility(label180, latLongVisible)
        })
        document.getElementById("LatLongLabelsButton").addEventListener("click", async () => {
          checkLabelVisibility(label180, latLongVisible)
        })


        // Labels for moon regions.
        let maresVisible = false
        let lacusVisible = false
        let sinusPalusVisible = false
        let cratersVisible = false
        let valleysVisible = false
        let monsVisible = false
        let montesVisible = false

        const regionLabels = []

        document.getElementById("MariaToggle").addEventListener("click", function () {
          maresVisible = !maresVisible
        })
        document.getElementById("LacusToggle").addEventListener("click", function () {
          lacusVisible = !lacusVisible
        })
        document.getElementById("SinusPalusToggle").addEventListener("click", function () {
          sinusPalusVisible = !sinusPalusVisible
        })
        document.getElementById("CratersToggle").addEventListener("click", function () {
          cratersVisible = !cratersVisible
        })
        document.getElementById("ValleysToggle").addEventListener("click", function () {
          valleysVisible = !valleysVisible
        })
        document.getElementById("MonsToggle").addEventListener("click", function () {
          monsVisible = !monsVisible
        })
        document.getElementById("MontesToggle").addEventListener("click", function () {
          montesVisible = !montesVisible
        })

        const createMareRegionLabel = (regionName, lat, long) => {
          const regionP = document.createElement('p')
          regionP.textContent = regionName

          const divRegion = document.createElement('div')
          divRegion.appendChild(regionP)
          regionP.className = "latLongLabelP"
          divRegion.className = "latLongLabelDiv"
          const regionLabel = new CSS2DObject(divRegion)
          scene.add(regionLabel)
          const regionLabelR = 10.1
          const regionLabelLat = lat
          const regionLabelLong = long
          const regionLabelPos = to_xyz(regionLabelR, regionLabelLat, regionLabelLong)
          regionLabel.position.set(regionLabelPos[0], regionLabelPos[1], regionLabelPos[2])
          regionLabel.userData.label = true
          regionLabel.userData.labelLatLong = true
          regionLabels.push(regionLabel)
          regionLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(regionLabel, maresVisible)
          })
          document.getElementById("MariaToggle").addEventListener("click", async () => {
            checkLabelVisibility(regionLabel, maresVisible)
          })
        }

        const createLacusRegionLabel = (regionName, lat, long) => {
          const regionP = document.createElement('p')
          regionP.textContent = regionName

          const divRegion = document.createElement('div')
          divRegion.appendChild(regionP)
          regionP.className = "latLongLabelP"
          divRegion.className = "latLongLabelDiv"
          const regionLabel = new CSS2DObject(divRegion)
          scene.add(regionLabel)
          const regionLabelR = 10.1
          const regionLabelLat = lat
          const regionLabelLong = long
          const regionLabelPos = to_xyz(regionLabelR, regionLabelLat, regionLabelLong)
          regionLabel.position.set(regionLabelPos[0], regionLabelPos[1], regionLabelPos[2])
          regionLabel.userData.label = true
          regionLabel.userData.labelLatLong = true
          regionLabels.push(regionLabel)
          regionLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(regionLabel, lacusVisible)
          })
          document.getElementById("LacusToggle").addEventListener("click", async () => {
            checkLabelVisibility(regionLabel, lacusVisible)
          })
        }

        const createSinusPalusRegionLabel = (regionName, lat, long) => {
          const regionP = document.createElement('p')
          regionP.textContent = regionName

          const divRegion = document.createElement('div')
          divRegion.appendChild(regionP)
          regionP.className = "latLongLabelP"
          divRegion.className = "latLongLabelDiv"
          const regionLabel = new CSS2DObject(divRegion)
          scene.add(regionLabel)
          const regionLabelR = 10.1
          const regionLabelLat = lat
          const regionLabelLong = long
          const regionLabelPos = to_xyz(regionLabelR, regionLabelLat, regionLabelLong)
          regionLabel.position.set(regionLabelPos[0], regionLabelPos[1], regionLabelPos[2])
          regionLabel.userData.label = true
          regionLabel.userData.labelLatLong = true
          regionLabels.push(regionLabel)
          regionLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(regionLabel, sinusPalusVisible)
          })
          document.getElementById("SinusPalusToggle").addEventListener("click", async () => {
            checkLabelVisibility(regionLabel, sinusPalusVisible)
          })
        }

        const createCratersRegionLabel = (regionName, lat, long) => {
          const regionP = document.createElement('p')
          regionP.textContent = regionName

          const divRegion = document.createElement('div')
          divRegion.appendChild(regionP)
          regionP.className = "latLongLabelP"
          divRegion.className = "latLongLabelDiv"
          const regionLabel = new CSS2DObject(divRegion)
          scene.add(regionLabel)
          const regionLabelR = 10.1
          const regionLabelLat = lat
          const regionLabelLong = long
          const regionLabelPos = to_xyz(regionLabelR, regionLabelLat, regionLabelLong)
          regionLabel.position.set(regionLabelPos[0], regionLabelPos[1], regionLabelPos[2])
          regionLabel.userData.label = true
          regionLabel.userData.labelLatLong = true
          regionLabels.push(regionLabel)
          regionLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(regionLabel, cratersVisible)
          })
          document.getElementById("CratersToggle").addEventListener("click", async () => {
            checkLabelVisibility(regionLabel, cratersVisible)
          })
        }

        const createValleysRegionLabel = (regionName, lat, long) => {
          const regionP = document.createElement('p')
          regionP.textContent = regionName

          const divRegion = document.createElement('div')
          divRegion.appendChild(regionP)
          regionP.className = "latLongLabelP"
          divRegion.className = "latLongLabelDiv"
          const regionLabel = new CSS2DObject(divRegion)
          scene.add(regionLabel)
          const regionLabelR = 10.1
          const regionLabelLat = lat
          const regionLabelLong = long
          const regionLabelPos = to_xyz(regionLabelR, regionLabelLat, regionLabelLong)
          regionLabel.position.set(regionLabelPos[0], regionLabelPos[1], regionLabelPos[2])
          regionLabel.userData.label = true
          regionLabel.userData.labelLatLong = true
          regionLabels.push(regionLabel)
          regionLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(regionLabel, valleysVisible)
          })
          document.getElementById("ValleysToggle").addEventListener("click", async () => {
            checkLabelVisibility(regionLabel, valleysVisible)
          })
        }

        const createMonsRegionLabel = (regionName, lat, long) => {
          const regionP = document.createElement('p')
          regionP.textContent = regionName

          const divRegion = document.createElement('div')
          divRegion.appendChild(regionP)
          regionP.className = "latLongLabelP"
          divRegion.className = "latLongLabelDiv"
          const regionLabel = new CSS2DObject(divRegion)
          scene.add(regionLabel)
          const regionLabelR = 10.1
          const regionLabelLat = lat
          const regionLabelLong = long
          const regionLabelPos = to_xyz(regionLabelR, regionLabelLat, regionLabelLong)
          regionLabel.position.set(regionLabelPos[0], regionLabelPos[1], regionLabelPos[2])
          regionLabel.userData.label = true
          regionLabel.userData.labelLatLong = true
          regionLabels.push(regionLabel)
          regionLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(regionLabel, monsVisible)
          })
          document.getElementById("MonsToggle").addEventListener("click", async () => {
            checkLabelVisibility(regionLabel, monsVisible)
          })
        }

        const createMontesRegionLabel = (regionName, lat, long) => {
          const regionP = document.createElement('p')
          regionP.textContent = regionName

          const divRegion = document.createElement('div')
          divRegion.appendChild(regionP)
          regionP.className = "latLongLabelP"
          divRegion.className = "latLongLabelDiv"
          const regionLabel = new CSS2DObject(divRegion)
          scene.add(regionLabel)
          const regionLabelR = 10.1
          const regionLabelLat = lat
          const regionLabelLong = long
          const regionLabelPos = to_xyz(regionLabelR, regionLabelLat, regionLabelLong)
          regionLabel.position.set(regionLabelPos[0], regionLabelPos[1], regionLabelPos[2])
          regionLabel.userData.label = true
          regionLabel.userData.labelLatLong = true
          regionLabels.push(regionLabel)
          regionLabel.visible = false
          window.addEventListener('mouseup', async () => {
            checkLabelVisibility(regionLabel, montesVisible)
          })
          document.getElementById("MontesToggle").addEventListener("click", async () => {
            checkLabelVisibility(regionLabel, montesVisible)
          })
        }

        // Lunar Maria
        createMareRegionLabel("Mare Anguis", 22.6, 67.7)
        createMareRegionLabel("Mare Australe", -38.9, 93.0)
        createMareRegionLabel("Mare Cognitum", -10.0, -23.1)
        createMareRegionLabel("Mare Crisium", 17.0, 59.1)
        createMareRegionLabel("Mare Fecunditatis", -7.8, 51.3)
        createMareRegionLabel("Mare Frigoris", 56.0, 1.4)
        createMareRegionLabel("Mare Humboldtianum", 56.8, 81.5)
        createMareRegionLabel("Mare Humorum", -24.4, -38.6)
        createMareRegionLabel("Mare Imbrium[3]", 32.8, -15.6)
        createMareRegionLabel("Mare Ingenii", -33.7, 163.5)
        createMareRegionLabel("Mare Insularum", 7.5, -30.9)
        createMareRegionLabel("Mare Marginis", 13.3, 86.1)
        createMareRegionLabel("Mare Moscoviense", 27.3, 147.9)
        createMareRegionLabel("Mare Nectaris", -15.2, 35.5)
        createMareRegionLabel("Mare Nubium", -21.3, -16.6)
        createMareRegionLabel("Mare Orientale", -19.4, -92.8)
        createMareRegionLabel("Mare Serenitatis", 28.0, 17.5)
        createMareRegionLabel("Mare Smythii", 1.3, 87.5)
        createMareRegionLabel("Mare Spumans", 1.1, 65.1)
        createMareRegionLabel("Mare Tranquillitatis", 8.5, 31.4)
        createMareRegionLabel("Mare Undarum", 6.8, 68.4)
        createMareRegionLabel("Mare Vaporum", 13.3, 3.6)
        createMareRegionLabel("Oceanus Procellarum", 18.4, -57.4)
        
        // Lunar Lacus
        createLacusRegionLabel("Lacus Aestatis", -15.0, -69.0)
        createLacusRegionLabel("Lacus Autumni", -9.9, -83.9)
        createLacusRegionLabel("Lacus Bonitatis", 23.2, 43.7)
        createLacusRegionLabel("Lacus Doloris", 17.1, 9.0)
        createLacusRegionLabel("Lacus Excellentiae", -35.4, -44.0)
        createLacusRegionLabel("Lacus Felicitatis", 19.0, 5.0)
        createLacusRegionLabel("Lacus Gaudii", 16.2, 12.6)
        createLacusRegionLabel("Lacus Hiemalis", 15.0, 14.0)
        createLacusRegionLabel("Lacus Lenitatis", 14.0, 12.0)
        createLacusRegionLabel("Lacus Luxuriae", 19.0, 176.0)
        createLacusRegionLabel("Lacus Mortis", 45.0, 27.2)
        createLacusRegionLabel("Lacus Oblivionis", -21.0, -168.0)
        createLacusRegionLabel("Lacus Odii", 19.0, 7.0)
        createLacusRegionLabel("Lacus Perseverantiae", 8.0, 62.0)
        createLacusRegionLabel("Lacus Solitudinis", -27.8, 104.3)
        createLacusRegionLabel("Lacus Somniorum", 38.0, 29.2)
        createLacusRegionLabel("Lacus Spei", 43.0, 65.0)
        createLacusRegionLabel("Lacus Temporis", 45.9, 58.4)
        createLacusRegionLabel("Lacus Timoris", -38.8, -27.3)
        createLacusRegionLabel("Lacus Veris", -16.5, -86.1)

        // Lunar Sinus and Paludes
        createSinusPalusRegionLabel("Palus Epidemiarum", -32.0, -28.2)
        createSinusPalusRegionLabel("Palus Putredinis", 26.5, 0.4)
        createSinusPalusRegionLabel("Palus Somni", 14.1, 45.0)
        createSinusPalusRegionLabel("Sinus Aestuum", 10.9, -8.8)
        createSinusPalusRegionLabel("Sinus Amoris", 18.1, 39.1)
        createSinusPalusRegionLabel("Sinus Asperitatis", -3.8, 27.4)
        createSinusPalusRegionLabel("Sinus Concordiae", 10.8, 43.2)
        createSinusPalusRegionLabel("Sinus Fidei", 18.0, 2.0)
        createSinusPalusRegionLabel("Sinus Honoris", 11.7, 18.1)
        createSinusPalusRegionLabel("Sinus Iridum", 44.1, -31.5)
        createSinusPalusRegionLabel("Sinus Lunicus", 31.8, -1.4)
        createSinusPalusRegionLabel("Sinus Medii", 2.4, 1.7)
        createSinusPalusRegionLabel("Sinus Roris", 54.0, -56.6)
        createSinusPalusRegionLabel("Sinus Successus", 0.9, 59.0)

        // Lunar craters.
        createCratersRegionLabel("Albategnius", -11.2, 4.1)
        createCratersRegionLabel("Aristarchus", 23.7, -47.4)
        createCratersRegionLabel("Aristoteles", 50.2, 17.4)
        createCratersRegionLabel("Bailly", -66.8, -69.4)
        createCratersRegionLabel("Clavius", -58.4, -14.4)
        createCratersRegionLabel("Copernicus", 9.62, -20.08)
        createCratersRegionLabel("Fra Mauro", -6.0, -17.0)
        createCratersRegionLabel("Humboldt", -27.02, 80.96)
        createCratersRegionLabel("Janssen", -44.96, 40.82)
        createCratersRegionLabel("Langrenus", -8.9, 60.9)
        createCratersRegionLabel("Longomontanus", -49.5, -21.7)
        createCratersRegionLabel("Maginus", -50.0, -6.2)
        createCratersRegionLabel("Metius", -40.3, 43.3)
        createCratersRegionLabel("Moretus", -70.6, -5.5)
        createCratersRegionLabel("Petavius", -25.3, 60.4)
        createCratersRegionLabel("Picard", 14.57, 54.72)
        createCratersRegionLabel("Piccolomini", -29.7, 32.3)
        createCratersRegionLabel("Pitatus", -29.88, -13.53)
        createCratersRegionLabel("Plinius", 15.4, 23.7)
        createCratersRegionLabel("Rheita", -37.1, 47.2)
        createCratersRegionLabel("Russell", 26.5, -75.4)
        createCratersRegionLabel("Schickard", -44.4, -55.1)
        createCratersRegionLabel("Seleucus", 21.0, -66.6)
        createCratersRegionLabel("Stadius", 10.48, -13.77)
        createCratersRegionLabel("Stöfler", -41.1, 6.0)
        createCratersRegionLabel("Thebit", -22.0, -4.0)
        createCratersRegionLabel("Theophilus", -11.4, 26.4)
        createCratersRegionLabel("Tycho", -43.31, -11.36)
        createCratersRegionLabel("Vendelinus", -16.46, 61.55)
        createCratersRegionLabel("Wargentin", -49.6, -60.2)


        createCratersRegionLabel("Catena Abulfeda", -16.9, 17.2)
        createCratersRegionLabel("Catena Artamonov", 26.0, 105.9)
        createCratersRegionLabel("Catena Brigitte", 18.5, 27.5)
        createCratersRegionLabel("Catena Davy", -11.0, -7.0)
        createCratersRegionLabel("Catena Dziewulski", 19.0, 100.0)
        createCratersRegionLabel("Catena Gregory", -0.6, 129.9)
        createCratersRegionLabel("Catena Humboldt", -21.5, 84.6)
        createCratersRegionLabel("Catena Krafft", 15.0, -72.0)
        createCratersRegionLabel("Catena Kurchatov", 37.2, 136.3)
        createCratersRegionLabel("Catena Leuschner", 4.7, -110.1)
        createCratersRegionLabel("Catena Littrow", 22.2, 29.5)
        createCratersRegionLabel("Catena Lucretius", -3.4, -126.1)
        createCratersRegionLabel("Catena Mendeleev", 6.3, 139.4)
        createCratersRegionLabel("Catena Michelson", 1.4, -113.4)
        createCratersRegionLabel("Catena Pierre", 19.8, -31.8)
        createCratersRegionLabel("Catena Sumner", 37.3, 112.3)
        createCratersRegionLabel("Catena Sylvester", 81.4, -86.2)
        createCratersRegionLabel("Catena Taruntius", 3.0, 48.0)
        createCratersRegionLabel("Catena Timocharis", 29.0, -13.0)
        createCratersRegionLabel("Catena Yuri", 24.4, -30.4)

        // Lunar Valleys
        createValleysRegionLabel("Vallis Alpes", 48.5, 3.2)
        createValleysRegionLabel("Vallis Baade", -45.9, -76.2)
        createValleysRegionLabel("Vallis Bohr", 12.4, -86.6)
        createValleysRegionLabel("Vallis Bouvard", -38.3, -83.1)
        createValleysRegionLabel("Vallis Capella", -7.6, 34.9)
        createValleysRegionLabel("Vallis Inghirami", -43.8, -72.2)
        createValleysRegionLabel("Vallis Palitzsch", -26.4, 64.3)
        createValleysRegionLabel("Vallis Planck", -58.4, 126.1)
        createValleysRegionLabel("Vallis Rheita", -42.5, 51.5)
        createValleysRegionLabel("Vallis Schrödinger", -67.0, 105.0)
        createValleysRegionLabel("Vallis Schröteri", 26.2, -50.8)
        createValleysRegionLabel("Vallis Snellius", -31.1, 56.0)

        // Lunar Mountains
        createMonsRegionLabel("Mons Agnes", 18.66, 5.34)
        createMonsRegionLabel("Mons Ampère", 19.32, -3.71)
        createMonsRegionLabel("Mons André", 5.18, 120.56)
        createMonsRegionLabel("Mons Ardeshir", 5.03, 121.04)
        createMonsRegionLabel("Mons Argaeus", 19.33, 29.01)
        createMonsRegionLabel("Mont Blanc", 45.41, 0.44)
        createMonsRegionLabel("Mons Bradley", 21.73, 0.38)
        createMonsRegionLabel("Mons Delisle", 29.42, -35.79)
        createMonsRegionLabel("Mons Dieter", 5.00, 120.30)
        createMonsRegionLabel("Mons Dilip", 5.58, 120.87)
        createMonsRegionLabel("Mons Esam", 14.61, 35.71)
        createMonsRegionLabel("Mons Ganau", 4.79, 120.59)
        createMonsRegionLabel("Mons Gruithuisen Delta", 36.07, -39.59)
        createMonsRegionLabel("Mons Gruithuisen Gamma", 36.56, -40.72)
        createMonsRegionLabel("Mons Hadley", 26.69, 4.12)
        createMonsRegionLabel("Mons Hadley Delta", 25.72, 3.71)
        createMonsRegionLabel("Mons Hansteen", -12.19, -50.21)
        createMonsRegionLabel("Mons Herodotus", 27.50, -52.94)
        createMonsRegionLabel("Mons Huygens", 19.92, -2.86)
        createMonsRegionLabel("Mons La Hire", 27.66, -25.51)
        createMonsRegionLabel("Mons Maraldi", 20.34, 35.50)
        createMonsRegionLabel("Mons Moro", -11.84, -19.84)
        createMonsRegionLabel("Mons Penck", -10.0, 21.74)
        createMonsRegionLabel("Mons Pico", 45.82, -8.87)
        createMonsRegionLabel("Mons Piton", 40.72, -0.92)
        createMonsRegionLabel("Mons Rümker", 40.76, -58.38)
        createMonsRegionLabel("Mons Usov", 11.91, 63.26)
        createMonsRegionLabel("Mons Vinogradov[5]", 22.35, -32.52)
        createMonsRegionLabel("Mons Vitruvius", 19.33, 30.74)
        createMonsRegionLabel("Mons Wolff", 16.88, -6.80)

        // Lunar Mountain Ranges
        createMontesRegionLabel("Montes Agricola", 29.06, -54.07)
        createMontesRegionLabel("Montes Alpes", 48.36, -0.58)
        createMontesRegionLabel("Montes Apenninus", 19.87, -0.03)
        createMontesRegionLabel("Montes Archimedes", 25.39, -5.25)
        createMontesRegionLabel("Montes Carpatus", 14.57, -23.62)
        createMontesRegionLabel("Montes Caucasus", 37.52, 9.93)
        createMontesRegionLabel("Montes Cordillera", -17.5, -79.5)
        createMontesRegionLabel("Montes Haemus", 17.11, 12.03)
        createMontesRegionLabel("Montes Harbinger", 26.89, -41.29)
        createMontesRegionLabel("Montes Jura", 47.49, -36.11)
        createMontesRegionLabel("Montes Pyrenaeus", -14.05, 41.51)
        createMontesRegionLabel("Montes Recti", 48.3, -19.72)
        createMontesRegionLabel("Montes Riphaeus", -7.48, -27.60)
        createMontesRegionLabel("Montes Rook", -20.6, -82.5)
        createMontesRegionLabel("Montes Secchi", 2.72, 43.17)
        createMontesRegionLabel("Montes Spitzbergen", 34.47, -5.21)
        createMontesRegionLabel("Montes Taurus", 27.32, 40.34)
        createMontesRegionLabel("Montes Teneriffe", 47.89, -13.19)


        // Nucleus and Mantle labels
        let innerLabelsVisible = false

        const nucleusP = document.createElement('p')
        nucleusP.textContent = "Nucleus (~330 km)"

        const divNucleus = document.createElement('div')
        divNucleus.appendChild(nucleusP)
        nucleusP.className = "latLongLabelP"
        divNucleus.className = "latLongLabelDiv"
        const nucleusLabel = new CSS2DObject(divNucleus)
        scene.add(nucleusLabel)
        nucleusLabel.position.set(0, 0, 0)
        nucleusLabel.userData.label = true
        nucleusLabel.userData.labelLatLong = true
        nucleusLabel.visible = false
        

        const mantleP = document.createElement('p')
        mantleP.textContent = "Inner mantle (~480 km)"

        const divMantle = document.createElement('div')
        divMantle.appendChild(mantleP)
        mantleP.className = "latLongLabelP"
        divMantle.className = "latLongLabelDiv"
        const mantleLabel = new CSS2DObject(divMantle)
        scene.add(mantleLabel)
        const mantleLabelR = 3.3786
        const mantleLabelLat = 40
        const mantleLabelLong = 50
        const mantleLabelPos = to_xyz(mantleLabelR, mantleLabelLat, mantleLabelLong)
        mantleLabel.position.set(mantleLabelPos[0], mantleLabelPos[1], mantleLabelPos[2])
        mantleLabel.userData.label = true
        mantleLabel.userData.labelLatLong = true
        mantleLabel.visible = false
        
        const checkInnerLabelsVisibility = () => {
          nucleusLabel.visible = dmVisible && innerLabelsVisible
          mantleLabel.visible = dmVisible && innerLabelsVisible
        }

        document.getElementById("DMLabels").addEventListener("click", async () => {
          innerLabelsVisible = !innerLabelsVisible
          checkInnerLabelsVisibility()
        })
        document.getElementById("DMToggle").addEventListener("click", async () => {
          checkInnerLabelsVisibility()
        })

        // Selector ring
        const ringGeo = new THREE.RingGeometry(0.13, 0.2, 20, 1);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const selector_ring = new THREE.Mesh(ringGeo, ringMaterial);
        selector_ring.position.set(0, 0, 0)
        selector_ring.userData.lat = 0
        selector_ring.userData.long = 0
        scene.add(selector_ring);
        selector_ring.visible = false

        document.getElementById("DMToggle").addEventListener("click", function () {
          if (selector_ring.userData.selectedType == "dm") {
            selector_ring.visible = !selector_ring.visible
          }
        });

        document.getElementById("Stations").addEventListener("click", function () {
          if (selector_ring.userData.selectedType == "station") {
            selector_ring.visible = !selector_ring.visible
          }
        });

        document.getElementById("SMToggle").addEventListener("click", function () {
          if (selector_ring.userData.selectedType == "sm") {
            selector_ring.visible = !selector_ring.visible
          }
        });

        document.getElementById("AIToggle").addEventListener("click", function () {
          if (selector_ring.userData.selectedType == "ai") {
            selector_ring.visible = !selector_ring.visible
          }
        });

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        window.addEventListener('click', event => {
          pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
          pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

          raycaster.setFromCamera(pointer, camera)
          const intersections = raycaster.intersectObjects(scene.children)

          const clickIntersections = intersections.filter(intersect => intersect.object.userData.clickable && intersect.object.visible)

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

            if (clickIntersections[0].object.userData.station) {
              selector_ring.userData.selectedType = "station"
            } else if (clickIntersections[0].object.userData.sm) {
              selector_ring.userData.selectedType = "sm"
            } else if (clickIntersections[0].object.userData.ai) {
              selector_ring.userData.selectedType = "ai"
            } else if (clickIntersections[0].object.userData.dm) {
              selector_ring.userData.selectedType = "dm"
            }
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

          labelRenderer.render(scene, camera)

          // Rotar el modelo
          if (controls) {
            controls.update(); // Actualizar los controles en cada cuadro
          }

          renderer.render(scene, camera);
        };

        window.addEventListener('resize', function () {
          camera.aspect = window.innerWidth / this.window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
          labelRenderer.setSize(this.window.innerWidth, this.window.innerHeight)
        })

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
