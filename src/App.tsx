import React, { useMemo, useRef, useState } from "react";
import Moon from "./components/moon";
import Apollo11 from "./components/apollo11";
import Apollo16 from "./components/apollo16";
import "./App.css";
import { Satellite, Disc, Globe, Sliders } from "lucide-react";
import StellarisoftImage from "./assets/stellarisoft.png";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any | null>(null);

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

  return (
    <>
      <div className="title">
        <h1>VIBRATIO 13 | NEXT GEN</h1>
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
      <div className="controlador">
        <div
          id="LatLongButton"
          className="controlador-item"
          onClick={handleItemClick}
          title="Lat and Lon"
        >
          <Globe size={16} />
        </div>
        <div
          id="DMToggle"
          className="controlador-item"
          onClick={handleItemClick}
          title="Deep moon quake"
        >
          <Disc size={16} />
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

      <Moon />
    </>
  );
}

export default App;
``;
