/* import { useState } from 'react' */
/* import React from 'react' */
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './login';
import Cadastro from './cadastro';
import Cadastro2 from './cadastro2';
import CadastroVeiculo from './CadastroVeiculo';
import { EntregadorProvider } from './EntregadorContext';
import Loading from '../components/Loading';
import 'daisyui/dist/full.css';
import Principal from './Principal';

function App() {
  return (
    <EntregadorProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/cadastro' element={<Cadastro />} />
          <Route path='/cadastro2' element={<Cadastro2 />} />
          <Route path='/cadastroveiculo' element={<CadastroVeiculo />} />
          <Route path='/login' element={<Login />} />
          <Route path='/loading' element={<Loading />} />
          <Route path='/Principal' element={<Principal />} />
        </Routes>
      </Router>
    </EntregadorProvider>
  );
}

export default App;
