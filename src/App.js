import './App.scss';
import Dashboard from './Dashboard';

import { useState } from 'react';

function App() {

  const [ view, setView ] = useState('CATEGORY');

  return (
    <div className="App">
      <header className="App__header">
        <button
          onClick={() => setView('CATEGORY')}
          className={view === 'CATEGORY' ? "active": ""}>Category</button>
        <button
          onClick={() => setView('TIMELINE')}
          className={view === 'TIMELINE' ? "active": ""}>Timeline</button>
      </header>
      <Dashboard view={view}/>
    </div>
  );
}

export default App;
