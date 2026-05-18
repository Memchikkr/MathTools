import { createBrowserRouter } from 'react-router';
import { RootPage } from './pages/Root.Page';
import { ModulePage } from './pages/Module.Page';

export const router = createBrowserRouter([
    {
        path: '/',
        children: [
            { index: true, element: <RootPage /> },
        ],
    },
    {
        path: '/module/:modulePath',
        element: <ModulePage />
    },
]);