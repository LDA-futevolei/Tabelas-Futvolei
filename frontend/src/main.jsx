import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import LoginForm from './pages/login.jsx';
import NotFound from './pages/404.jsx';

import './styles/index.css'
import Dashboard from './pages/dashboard/dashboard.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />}></Route>

                <Route path='/dashboard' element={<Dashboard />}></Route>
                <Route path='/dashboard/login' element={<LoginForm />}></Route>

                <Route path='*' element={<NotFound />}></Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
