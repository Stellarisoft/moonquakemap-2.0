import Moon from './components/moon'
import './App.css';

function App() {
  return (
    <>
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
