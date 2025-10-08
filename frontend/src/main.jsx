import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import LoginForm from './pages/login.jsx';
import './styles/index.css'
import NotFound from './pages/404.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />}></Route>
                <Route path='/dashboard/login' element={<LoginForm />}></Route>
                <Route path='*' element={<NotFound />}></Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
