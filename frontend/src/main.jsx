import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import LoginForm from './pages/login.jsx';
import NotFound from './pages/404.jsx';

import './styles/index.css'
import Dashboard from './pages/dashboard/dashboard.jsx';
import Tabela from './pages/Tabela.jsx';
import Setup from './pages/Setup.jsx';
import Torneios from './pages/Torneios.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />}></Route>

                <Route path='/dashboard' element={<Dashboard />}></Route>
                <Route path='/dashboard/login' element={<LoginForm />}></Route>

                <Route path='/tabela' element={<Tabela />}></Route>
                <Route path='/setup' element={<Setup />}></Route>
                <Route path='/torneios' element={<Torneios />}></Route>

                <Route path='*' element={<NotFound />}></Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
