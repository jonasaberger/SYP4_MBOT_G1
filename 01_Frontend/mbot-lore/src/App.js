import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
 
import Connection from './Components/Connection';
import AutomaticDrive from './Components/Automatic';
import MainControl from './Components/MainControl';

 
function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" index element={<Connection/>} />
        <Route path="/control" element={<MainControl/>}>
          <Route index element={<MainControl />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </div>
  );
}
 
export default App;