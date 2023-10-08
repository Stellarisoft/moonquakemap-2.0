import Moon from "./components/moon";
import "./App.css";
import { Satellite, Disc, Globe } from "lucide-react";
import StellarisoftImage from "./assets/stellarisoft.png";

function App() {
  // Función para manejar el clic en los elementos del controlador
  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const item = event.currentTarget;
    const isClicked = item.classList.contains("clicked");

    if (isClicked) {
      // Si ya se hizo clic, cambia el color de fondo al color original (rojo)
      item.style.backgroundColor = "rgb(34, 34, 34, 0.8)"; // Cambia al color original
    } else {
      // Si no se ha hecho clic previamente, cambia el color de fondo a otro color (azul)
      item.style.backgroundColor = "rgb(80, 80, 80, 0.8)"; // Cambia a un nuevo color
    }

    // Cambia el estado de clic agregando o eliminando la clase "clicked"
    item.classList.toggle("clicked");
  };

  return (
    <>
      <div className="title">
        <h1>VIBRATIO 13 | NEXT GEN</h1>
      </div>
      <div className="logo_app">
      <img className="logo" src={StellarisoftImage} alt="Stellarisoft" />
      </div>
      <div className="controlador">
        <div
          id="LatLongButton"
          className="controlador-item"
          onClick={handleItemClick}
        >
          <Globe size={16} />
        </div>
        <div
          id="DMToggle"
          className="controlador-item"
          onClick={handleItemClick}
        >
          <Disc size={16} />
        </div>
        <div
          id="Stations"
          className="controlador-item"
          onClick={handleItemClick}
        >
          <Satellite size={16} />
        </div>
      </div>

      <div className="progress-bar-container">
        <img className="logo" src={StellarisoftImage} alt="Stellarisoft" />
        <label htmlFor="progress-bar"></label>
        <div id="pill-container">
          <div id="pill"></div>
        </div>
        <progress id="progress-bar" value="0" max="100"></progress>
      </div>
      <Moon />
    </>
  );
}

export default App;
