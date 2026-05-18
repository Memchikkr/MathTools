import { Card, Text, ThemeIcon } from '@mantine/core';
import * as Icons from '@tabler/icons-react';
import { Module } from '../types/module';
import { useNavigate } from 'react-router-dom';

interface ModuleCardProps {
    module: Module;
}

export function ModuleCard({ module }: ModuleCardProps) {
    const navigate = useNavigate();
    const IconComponent = (Icons as any)[`Icon${module.icon || 'Box'}`] || Icons.IconBox;

    const handleClick = () => {
        navigate(`/module/${module.path}`);
    };

    return (
        <Card
            shadow="none"
            padding="md"
            radius={0}
            withBorder
            style={{
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                borderLeft: 'none',
                borderTop: 'none',
                backgroundColor: 'var(--mantine-color-body)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--mantine-color-body)';
            }}
            onClick={handleClick}
        >
            <ThemeIcon size="xl" variant="light" radius="md" mb="sm">
                <IconComponent size={32} />
            </ThemeIcon>
            <Text fw={600} size="md" mt="xs" lineClamp={1}>
                {module.name}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                {module.description}
            </Text>
        </Card>
    );
}