import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    Group,
    TextInput,
    NumberInput,
    Button,
    Alert,
    LoadingOverlay,
    Text,
    Code,
    Table,
} from '@mantine/core';
import { IconBinary } from '@tabler/icons-react';
import axios from '../api/axios';
import { BackButton } from '../components/BackButton';

interface ConvertStep {
    description: string;
    detail: string;
}

interface ConvertResponse {
    value: string;
    from_base: number;
    to_base: number;
    result: string;
    decimal: number;
    steps: ConvertStep[];
    common: { bin: string; oct: string; dec: string; hex: string };
}

export function BaseConverterPage() {
    const [value, setValue] = useState('1010');
    const [fromBase, setFromBase] = useState<number>(2);
    const [toBase, setToBase] = useState<number>(10);

    const [result, setResult] = useState<ConvertResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const convert = async () => {
        if (!value.trim()) {
            setError('Введите число');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await axios.post<ConvertResponse>('/base-convert', {
                value,
                from_base: fromBase,
                to_base: toBase,
            });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка преобразования');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="md" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />
            <BackButton />
            <Title order={2} mb="md" ta="center">
                Конвертер систем счисления
            </Title>

            <Paper shadow="sm" p="md" withBorder mb="md">
                <Stack gap="md">
                    <Group grow>
                        <TextInput
                            label="Число"
                            placeholder="Например, 1A3F или -1010"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        <NumberInput
                            label="Из системы"
                            min={2}
                            max={36}
                            value={fromBase}
                            onChange={(v) => setFromBase(Number(v) || 10)}
                        />
                        <NumberInput
                            label="В систему"
                            min={2}
                            max={36}
                            value={toBase}
                            onChange={(v) => setToBase(Number(v) || 10)}
                        />
                    </Group>
                    <Button onClick={convert} leftSection={<IconBinary size={16} />}>
                        Перевести
                    </Button>
                    {error && <Alert title="Ошибка" color="red">{error}</Alert>}
                </Stack>
            </Paper>

            {result && (
                <Paper shadow="sm" p="md" withBorder>
                    <Stack gap="md">
                        <div>
                            <Text size="sm" c="dimmed">Результат:</Text>
                            <Text fw={700} size="xl">
                                {result.value}<sub>{result.from_base}</sub>
                                {' = '}
                                {result.result}<sub>{result.to_base}</sub>
                            </Text>
                        </div>

                        <div>
                            <Text size="sm" c="dimmed" mb="xs">Во всех основных системах:</Text>
                            <Table withColumnBorders withRowBorders>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 600 }}>Двоичная (2)</td>
                                        <td><Code>{result.common.bin}</Code></td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600 }}>Восьмеричная (8)</td>
                                        <td><Code>{result.common.oct}</Code></td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600 }}>Десятичная (10)</td>
                                        <td><Code>{result.common.dec}</Code></td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600 }}>Шестнадцатеричная (16)</td>
                                        <td><Code>{result.common.hex}</Code></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>

                        {result.steps.length > 0 && (
                            <div>
                                <Text size="sm" fw={500} mb="xs">Пошагово:</Text>
                                <Stack gap="sm">
                                    {result.steps.map((step, idx) => (
                                        <Paper key={idx} withBorder p="sm">
                                            <Text size="sm" fw={500}>{step.description}</Text>
                                            <Code block>{step.detail}</Code>
                                        </Paper>
                                    ))}
                                </Stack>
                            </div>
                        )}
                    </Stack>
                </Paper>
            )}
        </Container>
    );
}
