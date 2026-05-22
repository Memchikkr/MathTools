import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    TextInput,
    Button,
    Text,
    Alert,
    LoadingOverlay,
    Group,
    Switch,
} from '@mantine/core';
import { BlockMath } from "react-katex";
import { IconMathFunction } from '@tabler/icons-react';
import axios from '../api/axios';
import { BackButton } from '../components/BackButton';

export function IntegralCalculatorPage() {
    const [expression, setExpression] = useState('x**2 * sin(x)');
    const [variable, setVariable] = useState('x');
    const [isDefinite, setIsDefinite] = useState(false);
    const [lowerLimit, setLowerLimit] = useState('0');
    const [upperLimit, setUpperLimit] = useState('1');
    const [resultLatex, setResultLatex] = useState<string | null>(null);
    const [numericValue, setNumericValue] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async () => {
        if (!expression.trim()) {
            setError('Введите подынтегральную функцию');
            return;
        }
        if (isDefinite && (!lowerLimit.trim() || !upperLimit.trim())) {
            setError('Укажите пределы интегрирования');
            return;
        }

        setLoading(true);
        setError(null);
        setResultLatex(null);
        setNumericValue(null);

        try {
            const payload: any = { expression, variable };
            if (isDefinite) {
                payload.lower_limit = lowerLimit;
                payload.upper_limit = upperLimit;
            }

            const response = await axios.post('/integral-calculate', payload);
            if (response.data.error) {
                setError(response.data.error);
            } else {
                setResultLatex(response.data.result_latex);
                setNumericValue(response.data.numeric_value);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка вычисления');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="md" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />

            <BackButton />

            <Title order={2} mb="md" ta="center">
                Калькулятор интегралов
            </Title>
            <Paper shadow="sm" p="md" withBorder>
                <Stack gap="md">
                    <TextInput
                        label="Подынтегральная функция"
                        placeholder="x**2 * sin(x)"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                    />
                    <TextInput
                        label="Переменная интегрирования"
                        placeholder="x"
                        value={variable}
                        onChange={(e) => setVariable(e.target.value)}
                    />
                    <Switch
                        label="Определённый интеграл"
                        checked={isDefinite}
                        onChange={(e) => setIsDefinite(e.currentTarget.checked)}
                    />
                    {isDefinite && (
                        <Group grow>
                            <TextInput
                                label="Нижний предел"
                                value={lowerLimit}
                                onChange={(e) => setLowerLimit(e.target.value)}
                            />
                            <TextInput
                                label="Верхний предел"
                                value={upperLimit}
                                onChange={(e) => setUpperLimit(e.target.value)}
                            />
                        </Group>
                    )}
                    <Button onClick={calculate} leftSection={<IconMathFunction size={16} />}>
                        Вычислить интеграл
                    </Button>

                    {resultLatex && (
                        <Paper withBorder p="md" bg="var(--mantine-color-default-hover)">
                            <Text size="sm" c="dimmed">Результат:</Text>
                            <BlockMath math={resultLatex} />
                            {numericValue !== null && (
                                <Text mt="xs">Численное значение: {numericValue}</Text>
                            )}
                        </Paper>
                    )}

                    {error && <Alert title="Ошибка" color="red">{error}</Alert>}
                </Stack>
            </Paper>
        </Container>
    );
}
