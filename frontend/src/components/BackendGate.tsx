import { useEffect, useState } from 'react';
import { Center, Loader, Stack, Text } from '@mantine/core';
import axios from '../api/axios';

export function BackendGate({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const wait = async () => {
            while (!cancelled) {
                try {
                    await axios.get('/');
                    if (!cancelled) setReady(true);
                    return;
                } catch {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }
        };

        wait();

        return () => {
            cancelled = true;
        };
    }, []);

    if (!ready) {
        return (
            <Center style={{ height: '100vh' }}>
                <Stack align="center" gap="md">
                    <Loader size="xl" />
                    <Text c="dimmed">Запуск приложения…</Text>
                </Stack>
            </Center>
        );
    }

    return <>{children}</>;
}
