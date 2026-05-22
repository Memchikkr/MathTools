import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    TextInput,
    NumberInput,
    Button,
    Text,
    Alert,
    LoadingOverlay,
    Grid,
} from '@mantine/core';
import { BlockMath } from 'react-katex';
import { IconMathFunction } from '@tabler/icons-react';
import axios from '../api/axios';
import { BackButton } from '../components/BackButton';

export function DerivativeCalculatorPage() {
    const [expression, setExpression] = useState('x**2 * sin(x)');
    const [variable, setVariable] = useState('x');
    const [order, setOrder] = useState<number>(1);
    const [resultLatex, setResultLatex] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async () => {
        if (!expression.trim()) {
            setError('Введите функцию');
            return;
        }
        if (order < 1) {
            setError('Порядок производной должен быть >= 1');
            return;
        }

        setLoading(true);
        setError(null);
        setResultLatex(null);

        try {
            const response = await axios.post('/derivative-calculate', {
                expression,
                variable,
                order,
            });
            if (response.data.error) {
                setError(response.data.error);
            } else {
                setResultLatex(response.data.result_latex);
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
                Калькулятор производной
            </Title>
            <Paper shadow="sm" p="md" withBorder>
                <Stack gap="md">
                    <TextInput
                        label="Функция f(x)"
                        placeholder="x**2 * sin(x)"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                    />
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Переменная"
                                placeholder="x"
                                value={variable}
                                onChange={(e) => setVariable(e.target.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Порядок производной"
                                min={1}
                                max={10}
                                value={order}
                                onChange={(val) => setOrder(Number(val) || 1)}
                            />
                        </Grid.Col>
                    </Grid>
                    <Button onClick={calculate} leftSection={<IconMathFunction size={16} />}>
                        Вычислить производную
                    </Button>

                    {resultLatex && (
                        <Paper withBorder p="md" bg="var(--mantine-color-default-hover)">
                            <Text size="sm" c="dimmed">Результат:</Text>
                            <BlockMath math={resultLatex} />
                        </Paper>
                    )}

                    {error && <Alert title="Ошибка" color="red">{error}</Alert>}
                </Stack>
            </Paper>
        </Container>
    );
}