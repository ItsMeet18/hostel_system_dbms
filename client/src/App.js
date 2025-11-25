import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Students from './components/Students';
import Rooms from './components/Rooms';
import Allocations from './components/Allocations';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-logo">🏠 Hostel Management</h1>
            <ul className="nav-menu">
              <li><Link to="/students" className="nav-link">Students</Link></li>
              <li><Link to="/rooms" className="nav-link">Rooms</Link></li>
              <li><Link to="/allocations" className="nav-link">Allocations</Link></li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Students />} />
            <Route path="/students" element={<Students />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/allocations" element={<Allocations />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
