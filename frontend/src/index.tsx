import { MantineProvider } from '@mantine/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'katex/dist/katex.min.css';
import './katex-fix.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './Router';
import { Notifications } from '@mantine/notifications';
import { ColorSchemeToggle } from './components/ColorSchemeToggle';
import { BackendGate } from './components/BackendGate';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme='dark'>
      <ColorSchemeToggle/>
      <Notifications position="top-right" />
      <BackendGate>
        <RouterProvider router={router} />
      </BackendGate>
    </MantineProvider>
  </React.StrictMode>
);
