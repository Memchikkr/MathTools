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
} from '@mantine/core';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from 'recharts';
import { IconWaveSine } from '@tabler/icons-react';
import axios from '../api/axios';
import { BackButton } from '../components/BackButton';

interface OdeResponse {
    x: number[];
    euler: (number | null)[];
    rk4: (number | null)[];
}

export function OdeSolverPage() {
    const [expression, setExpression] = useState('y - x**2 + 1');
    const [xMin, setXMin] = useState<number>(0);
    const [xMax, setXMax] = useState<number>(2);
    const [y0, setY0] = useState<number>(0.5);
    const [steps, setSteps] = useState<number>(20);

    const [data, setData] = useState<OdeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const solve = async () => {
        if (!expression.trim()) {
            setError('Введите правую часть f(x, y)');
            return;
        }
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const response = await axios.post<OdeResponse>('/ode-solve', {
                expression,
                x_min: xMin,
                x_max: xMax,
                y0,
                steps,
            });
            setData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка решения ОДУ');
        } finally {
            setLoading(false);
        }
    };

    const chartData = data
        ? data.x.map((x, i) => ({
              x,
              euler: data.euler[i] ?? null,
              rk4: data.rk4[i] ?? null,
          }))
        : [];

    // Простая оценка расхождения двух методов в конечной точке
    const diff =
        data && data.euler.length > 0 && data.rk4.length > 0
            ? Math.abs(
                  (data.euler[data.euler.length - 1] ?? 0) -
                      (data.rk4[data.rk4.length - 1] ?? 0)
              )
            : null;

    return (
        <Container size="lg" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />
            <BackButton />
            <Title order={2} mb="md" ta="center">
                Решатель ОДУ: Эйлер vs РК4
            </Title>

            <Paper shadow="sm" p="md" withBorder mb="md">
                <Stack gap="md">
                    <TextInput
                        label="Правая часть f(x, y)"
                        description="Задача Коши: y' = f(x, y), y(x_min) = y0"
                        placeholder="y - x**2 + 1"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                    />
                    <Group grow>
                        <NumberInput
                            label="x_min"
                            value={xMin}
                            onChange={(v) => setXMin(Number(v) || 0)}
                        />
                        <NumberInput
                            label="x_max"
                            value={xMax}
                            onChange={(v) => setXMax(Number(v) || 0)}
                        />
                        <NumberInput
                            label="y(x_min) = y0"
                            value={y0}
                            onChange={(v) => setY0(Number(v) || 0)}
                        />
                        <NumberInput
                            label="Число шагов"
                            min={1}
                            max={10000}
                            value={steps}
                            onChange={(v) => setSteps(Number(v) || 20)}
                        />
                    </Group>
                    <Button onClick={solve} leftSection={<IconWaveSine size={16} />}>
                        Решить
                    </Button>
                    {error && <Alert title="Ошибка" color="red">{error}</Alert>}
                </Stack>
            </Paper>

            {data && (
                <Paper shadow="sm" p="md" withBorder>
                    <Stack gap="md">
                        <div style={{ width: '100%', height: 420 }}>
                            <ResponsiveContainer>
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis
                                        dataKey="x"
                                        type="number"
                                        domain={['dataMin', 'dataMax']}
                                        tickFormatter={(v) => Number(v).toFixed(2)}
                                    />
                                    <YAxis tickFormatter={(v) => Number(v).toFixed(2)} />
                                    <Tooltip
                                        formatter={(v: any) =>
                                            v === null ? '—' : Number(v).toFixed(6)
                                        }
                                        labelFormatter={(v) => `x = ${Number(v).toFixed(4)}`}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="euler"
                                        name="Эйлер"
                                        stroke="#fa5252"
                                        dot={false}
                                        connectNulls={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rk4"
                                        name="РК4"
                                        stroke="#228be6"
                                        dot={false}
                                        connectNulls={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {diff !== null && (
                            <Text size="sm" c="dimmed">
                                |Эйлер − РК4| в конечной точке: {diff.toExponential(3)}.
                                Чем меньше шаг, тем меньше разница; РК4 сходится к точному решению значительно быстрее.
                            </Text>
                        )}
                    </Stack>
                </Paper>
            )}
        </Container>
    );
}
