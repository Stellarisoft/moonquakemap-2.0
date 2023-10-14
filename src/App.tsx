import React, { useMemo, useRef, useState } from "react";
import Moon from "./components/moon";
import Apollo11 from "./components/apollo11";
import Apollo16 from "./components/apollo16";
import "./App.css";
import { Satellite, Disc, Globe, Sliders, Rocket, Activity, RefreshCwOff, DraftingCompass, Map, Waves, Shell, Circle, Minus, Mountain, MountainSnow, TowerControl, CircleEllipsis } from "lucide-react";
import StellarisoftImage from "./assets/stellarisoft.png";
import { info_attribute, station, sm, ai, dm } from "./util/types";

// Define componentes para cada misión
const MissionInfo1 = () => (
  <div className="modal-info">
    <div>
      <Apollo11 />
    </div>
    <div>
      <p>The Passive Seismic Experiment was the first seismometer placed on the lunar surface. It detected "lunar earthquakes" and provided information about the internal structure of the Moon. It contained four seismometers powered by solar panels, which measured meteorite impacts and lunar earthquakes. The experiment operated only during lunar days and was stopped by the overheating of the sun. It was the first use of nuclear power on a NASA manned mission.</p>
    </div>
  </div>
);

const MissionInfo2 = () => (
  <div>
    <p>Información personalizada para Apollo 12.</p>
    {/* Agrega aquí la estructura y contenido específico de Apollo 12 */}
  </div>
);

const MissionInfo3 = () => (
  <div>
    <p>Información personalizada para Apollo 14.</p>
    {/* Agrega aquí la estructura y contenido específico de Apollo 14 */}
  </div>
);

const MissionInfo4 = () => (
  <div>
    <p>Información personalizada para Apollo 15.</p>
    {/* Agrega aquí la estructura y contenido específico de Apollo 15 */}
  </div>
);

const MissionInfo5 = () => (
  <div className="modal-info">
    <div>
      <Apollo16 />
    </div>
    <div>
      <p>The Apollo 16 Passive Seismic Experiment was a seismometer that studied lunar earthquakes and the internal structure of the Moon. It recorded more than 10,000 earthquakes and 2,000 meteorite impacts in eight years. The largest impact occurred on the far side of the Moon near Mare Moscoviense. The experiment revealed that the Moon has a small, cold and dry core.</p>
    </div>
  </div>
);

function App() {
  const missionIndexes = [11, 12, 14, 15, 16];
  const missionRefs = missionIndexes.map(() =>
    useRef<HTMLDivElement | null>(null)
  );
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const settingsRegionesRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any | null>(null);

  // Data
  let stations: station[]
  let sm: sm[]
  let ai: ai[]
  let dm: dm[]

  const fetch_data = async () => {
    console.log("FETCHED from App.tsx")
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

  // For the info display.
  const [displayInfo, setDisplayInfo] = useState<info_attribute[]>([])

  const parseLat = (lat: string) => {
    if (lat.split("")[0] == "-") {
      return lat.split("-")[1] + "° S"
    } else {
      return lat + "° N"
    }
  }

  const parseLong = (long: string) => {
    if (long.split("")[0] == "-") {
      return long.split("-")[1] + "° W"
    } else {
      return long + "° E"
    }
  }

  const resetDisplayInfo = (type: string, id: string) => {
    if (type == "station") {
      const attributes: info_attribute[] = []
      const st: station | undefined = stations.find(station => station.id == id)
      attributes.push({ tag: "Mission", value: st?.mission })
      attributes.push({
        tag: "Start date", value: st?.startYear.toString() + "-" + st?.startMonth.toString() + "-" + st?.startDay.toString()
      })
      attributes.push({
        tag: "End date", value: st?.endYear.toString() + "-" + st?.endMonth.toString() + "-" + st?.endDay.toString()
      })
      attributes.push({ tag: "Lat.", value: parseLat(st?.lat.toString()) })
      attributes.push({ tag: "Long.", value: parseLong(st?.long.toString()) })
      setDisplayInfo(attributes)
    } else if (type == "sm") {
      const attributes: info_attribute[] = []
      const sm_i: sm | undefined = sm.find(i => i.id == id)
      attributes.push({ tag: "Type", value: sm_i?.type })
      attributes.push({
        tag: "Date", value: sm_i?.year.toString() + "-" + sm_i?.month.toString() + "-" + sm_i?.day.toString() + "  " + sm_i?.h.toString() + ":" + sm_i?.m.toString() + ":" + sm_i?.s.toString()
      })
      attributes.push({ tag: "Lat.", value: parseLat(sm_i?.lat.toString()) })
      attributes.push({ tag: "Long.", value: parseLong(sm_i?.long.toString()) })
      attributes.push({ tag: "Mag.", value: sm_i?.mag.toString() })
      setDisplayInfo(attributes)
    } else if (type == "ai") {
      const attributes: info_attribute[] = []
      const ai_i: ai | undefined = ai.find(i => i.id == id)
      attributes.push({ tag: "Type", value: ai_i?.type })
      attributes.push({
        tag: "Date", value: ai_i?.year.toString() + "-" + ai_i?.month.toString() + "-" + ai_i?.day.toString() + "  " + ai_i?.h.toString() + ":" + ai_i?.m.toString() + ":" + ai_i?.s.toString()
      })
      attributes.push({ tag: "Lat.", value: parseLat(ai_i?.lat.toString()) })
      attributes.push({ tag: "Long.", value: parseLong(ai_i?.long.toString()) })
      attributes.push({ tag: "Mag.", value: ai_i?.mag.toString() })
      setDisplayInfo(attributes)
    } else if (type == "dm") {
      const attributes: info_attribute[] = []
      const dm_i: dm | undefined = dm.find(i => i.id == id)
      attributes.push({ tag: "Type", value: dm_i?.type })
      attributes.push({
        tag: "Date", value: dm_i?.year.toString() + "-" + dm_i?.month.toString() + "-" + dm_i?.day.toString() + "  " + dm_i?.h.toString() + ":" + dm_i?.m.toString() + ":" + dm_i?.s.toString()
      })
      attributes.push({ tag: "Lat.", value: parseLat(dm_i?.lat.toString()) })
      attributes.push({ tag: "Long.", value: parseLong(dm_i?.long.toString()) })
      attributes.push({ tag: "Depth", value: dm_i?.depth.toString() + " km" })
      setDisplayInfo(attributes)
    }
  }

  const missionsData = [
    {
      title: "Apollo 11",
      component: <MissionInfo1 />,
    },
    {
      title: "Apollo 12",
      component: <MissionInfo2 />,
    },
    {
      title: "Apollo 14",
      component: <MissionInfo3 />,
    },
    {
      title: "Apollo 15",
      component: <MissionInfo4 />,
    },
    {
      title: "Apollo 16",
      component: <MissionInfo5 />,
    },
    // Agrega aquí más misiones con sus componentes personalizados
  ];

  const handleShowMissionsClick = () => {
    missionRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.classList.toggle("show");
      }
    });
  };

  const handleShowSettingsClick = () => {
    const controladorItems = document.querySelectorAll(".controlador-item");

    controladorItems.forEach((item) => {
      const element = item as HTMLElement;
      if (element !== settingsRef.current) {
        if (element.style.visibility === "hidden") {
          element.style.visibility = "visible";
        } else {
          element.style.visibility = "hidden";
        }
      }
    });

    if (settingsRef.current) {
      const settingsButton = settingsRef.current;
      if (settingsButton.style.backgroundColor === "") {
        settingsButton.style.backgroundColor = "rgb(34, 34, 34, 0.8)";
      } else {
        settingsButton.style.backgroundColor = "";
      }
    }

    const fakeEvent = {
      currentTarget: settingsRef.current,
    } as React.MouseEvent<HTMLDivElement>;

    handleItemClick(fakeEvent);
  };

  const handleShowSettingsRegionesClick = () => {
    const controladorRegionesItems = document.querySelectorAll(".controlador-regiones-item");

    controladorRegionesItems.forEach((item) => {
      const element = item as HTMLElement;
      if (element !== settingsRegionesRef.current) {
        if (element.style.visibility === "hidden") {
          element.style.visibility = "visible";
        } else {
          element.style.visibility = "hidden";
        }
      }
    });

    if (settingsRegionesRef.current) {
      const settingsRegionesButton = settingsRegionesRef.current;
      if (settingsRegionesButton.style.backgroundColor === "") {
        settingsRegionesButton.style.backgroundColor = "rgb(34, 34, 34, 0.8)";
      } else {
        settingsRegionesButton.style.backgroundColor = "";
      }
    }

    const fakeEvent = {
      currentTarget: settingsRegionesRef.current,
    } as React.MouseEvent<HTMLDivElement>;

    handleItemClick(fakeEvent);
  };

  const handleItemClick = useMemo(
    () => (event: React.MouseEvent<HTMLDivElement>) => {
      const item = event.currentTarget;
      const isClicked = item.classList.contains("clicked");

      if (isClicked) {
        item.style.backgroundColor = "rgb(34, 34, 34, 0.8)";
      } else {
        item.style.backgroundColor = "rgb(80, 80, 80, 0.8)";
      }

      item.classList.toggle("clicked");
    },
    []
  );

  const openMissionModal = (missionData: any) => {
    setSelectedMission(missionData);
    setIsModalOpen(true);
  };

  const closeMissionModal = () => {
    setIsModalOpen(false);
    setSelectedMission(null);
  };

  const handleMissionClick = (index: number) => {
    const missionData = missionsData[index];
    openMissionModal(missionData);
  };

  fetch_data()

  return (
    <>
      <div className="title">
        <h1>VIBRATIO 13 | NEXT GEN</h1>
      </div>
      <div className="selected_info">
        {
          displayInfo.length != 0 ? (
            displayInfo[0].value.split(" ")[0] == "Shallow" || displayInfo[0].value.split(" ")[0] == "Artificial" || displayInfo[0].value.split(" ")[0] == "Deep" ? (
              <b className="selected_info_header">
                Selected event:
              </b>
            ) : (displayInfo[0].value.split(" ")[0] == "Apollo" ? (
                <b className="selected_info_header">
                  Selected station:
                </b>
            ) : (<></>))
            
          ) : (<></>)
        }
        {
          displayInfo.length != 0 ? (
            displayInfo?.map(attribute => (
              <p key={attribute.tag}><b>{attribute.tag}: </b>{attribute.value}</p>
            ))
          ) : (
              <>
                <b className="selected_info_placeholder">No event selected</b>
                <div className="selected_info_placeholder_items">
                  <div className="selected_info_placeholder_icon">
                    <Satellite size={18} />
                  </div>
                  <div className="selected_info_placeholder_icon">
                    <Rocket size={18} />
                  </div>
                  <div className="selected_info_placeholder_icon">
                    <Activity size={18} />
                  </div>
                  <div className="selected_info_placeholder_icon">
                    <Disc size={18} />
                  </div>
                </div>
              </>
          )
        }
      </div>
      <div className="contenedor_principal">
        <div className="mostrar_misiones" onClick={handleShowMissionsClick}>
          <p onClick={handleItemClick}>Show missions</p>
        </div>
        {missionRefs.map((missionRef, index) => (
          <div key={index} ref={missionRef} className="mision">
            <p onClick={() => handleMissionClick(index)}>
              Apollo {missionIndexes[index]}
            </p>
          </div>
        ))}
      </div>
      <div className="logo_app">
        <img className="logo" src={StellarisoftImage} alt="Stellarisoft" />
      </div>

      <div className="controlador-regiones">
        <div
          id="MontesToggle"
          className="controlador-regiones-item"
          onClick={handleItemClick}
          title="Montes' labels"
        >
          <MountainSnow size={16} />
        </div>
        <div
          id="MonsToggle"
          className="controlador-regiones-item"
          onClick={handleItemClick}
          title="Mons' labels"
        >
          <Mountain size={16} />
        </div>
        <div
          id="ValleysToggle"
          className="controlador-regiones-item"
          onClick={handleItemClick}
          title="Valleys' labels"
        >
          <Minus size={16} />
        </div>
        <div
          id="CratersToggle"
          className="controlador-regiones-item"
          onClick={handleItemClick}
          title="Craters' labels"
        >
          <Circle size={16} />
        </div>
        <div
          id="SinusPalusToggle"
          className="controlador-regiones-item"
          onClick={handleItemClick}
          title="Bays' labels"
        >
          <TowerControl size={16} />
        </div>
        <div
          id="LacusToggle"
          className="controlador-regiones-item"
          onClick={handleItemClick}
          title="Lakes' labels"
        >
          <Waves size={16} />
        </div>
        <div
          id="MariaToggle"
          className="controlador-regiones-item"
          onClick={handleItemClick}
          title="Seas' labels"
        >
          <Shell size={16} />
        </div>
        <div
          id="settings-regiones"
          className="collapse-controlador-regiones-item"
          onClick={() => {
            handleShowSettingsRegionesClick();
          }}
          title="Show Regions"
          ref={settingsRegionesRef}
        >
          <Map size={16} />
        </div>
      </div>


      <div className="controlador">
        <div
          id="RotationButton"
          className="controlador-item"
          onClick={handleItemClick}
          title="Rotation OFF"
        >
          <RefreshCwOff size={16} />
        </div>
        <div
          id="LatLongLabelsButton"
          className="controlador-item"
          onClick={handleItemClick}
          title="Lat./Long. labels"
        >
          <DraftingCompass size={16} />
        </div>
        <div
          id="LatLongButton"
          className="controlador-item"
          onClick={handleItemClick}
          title="Lat. & Long."
        >
          <Globe size={16} />
        </div>
        <div
          id="DMLabels"
          className="controlador-item"
          onClick={handleItemClick}
          title="Inner labels"
        >
          <CircleEllipsis size={16} />
        </div>
        <div
          id="DMToggle"
          className="controlador-item"
          onClick={handleItemClick}
          title="Deep moonquake"
        >
          <Disc size={16} />
        </div>
        <div
          id="SMToggle"
          className="controlador-item"
          onClick={handleItemClick}
          title="Shallow moonquake"
        >
          <Activity size={16} />
        </div>
        <div
          id="AIToggle"
          className="controlador-item"
          onClick={handleItemClick}
          title="Artificial impacts"
        >
          <Rocket size={16} />
        </div>
        <div
          id="Stations"
          className="controlador-item"
          onClick={handleItemClick}
          title="Stations"
        >
          <Satellite size={16} />
        </div>
        <div
          id="settings"
          className="collapse-controlador-item"
          onClick={() => {
            handleShowSettingsClick();
          }}
          title="Show settings"
          ref={settingsRef}
        >
          <Sliders size={16} />
        </div>
      </div>

      <div className="progress-bar-container">
        <img className="logo" src={StellarisoftImage} alt="Stellarisoft" />
        <label htmlFor="progress-bar"></label>
        <div id="pill-container">
          <div id="pill"></div>
        </div>
        <div className="auxiliarText">
          <p>VIBRATIO 13 | NEXT GEN</p>
        </div>
        <progress id="progress-bar" value="0" max="100"></progress>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeMissionModal}>
              &times;
            </span>
            <h2>{selectedMission.title}</h2>
            {selectedMission.component}
          </div>
        </div>
      )}

      <Moon resetDisplayInfo={resetDisplayInfo} />
    </>
  );
}

export default App;
``;
