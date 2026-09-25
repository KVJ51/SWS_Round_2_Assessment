import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'documents' && <Dashboard />}
        {activeTab === 'chat' && <Assistant />}
      </main>
    </div>
  );
}

export default App;
