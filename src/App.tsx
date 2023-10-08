/* eslint-disable prefer-const */
import Moon from './components/moon'
import './App.css';
import RangeSelector from './components/RangeSelector';

function App() {
  return (
    <>
      <h1 id="LatLongButton">Lat & Long</h1>
      <h1 id="Stations">Stations</h1>
      <h1 id="AI">Artificial Impacts</h1>
      <h1 id="SM">Shallow moonquakes</h1>
      <h1 id="DMToggle">Deep Moonquakes</h1>
      <RangeSelector min={-14256000} max={244512000} />
      <div className='progress-bar-container'>
        <label htmlFor='progress-bar'></label>
        <div id="pill-container">
            <div id="pill"></div>
        </div>
        <progress id='progress-bar' value='0' max='100'></progress>
    </div>
    <Moon />
    </>
  )
}

export default App
