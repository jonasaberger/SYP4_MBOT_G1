import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ConnectionComponent from './Components/Connection';
import MainControl from './Components/MainControl';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ConnectionComponent />} />
          <Route path="/control" element={<MainControl />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;