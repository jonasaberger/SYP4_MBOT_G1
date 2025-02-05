import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
 
import Connection from './Components/Connection_Component';
import AutomaticDrive from './Components/Automatic_Drive_Component';
import MainControl from './Components/Main_Control';

 
function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        
        <Route path="/connection" index element={<Connection/>} />
        <Route path="/" element={<MainControl/>}>
          <Route index element={<MainControl />} />
          <Route path="/automatic" element={<AutomaticDrive />} />
        
        </Route>
        
      </Routes>
      </BrowserRouter>
    </div>
  );
}
 
export default App;