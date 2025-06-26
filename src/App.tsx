import { GridAnimation } from './components/GridAnimation'

function App() {
  return (
    <div className="App">
      <div className="flex-container">
        <div className="text-container">
          <h1>Grid Animation with Web Worker</h1>
          <p>
            This is a simple grid animation built with React and Web Worker.
          </p>
          <p>
            Just click and drag your mouse inside the canvas to start the animation.
          </p>
        </div>
        <div className="animation-container">
          <GridAnimation />
        </div>
      </div>
    </div>
  )
}

export default App
