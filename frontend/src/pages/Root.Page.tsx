import { Container, Grid, Title, Loader, Center, Alert, SimpleGrid } from '@mantine/core';
import { ModuleCard } from '../components/ModuleCard';
import axios from '../api/axios';
import { Module } from '../types/module';
import { useState, useEffect } from 'react';

export function RootPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/'); // GET "/" от бэкенда
                setModules(response.data.modules);
            } catch (err) {
                setError('Не удалось загрузить список модулей');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    if (loading) {
        return (
            <Center style={{ height: '80vh' }}>
                <Loader size="xl" />
            </Center>
        );
    }

    if (error) {
        return (
            <Container size="lg" py="xl">
                <Alert title="Ошибка" color="red">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <>
            <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                spacing={4}
                verticalSpacing={4}
                style={{
                    minHeight: 'calc(100vh - 60px)',
                    alignItems: 'stretch',
                }}
            >
                {modules.map((module) => (
                    <ModuleCard key={module.id} module={module} />
                ))}
            </SimpleGrid>
        </>
    );
}
