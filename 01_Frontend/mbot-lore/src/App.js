import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
 
import Connection from './Components/Connection_Component';

 
function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        
        <Route path="/" index element={<Connection/>} />

        
      </Routes>
      </BrowserRouter>
    </div>
  );
}
 
export default App;