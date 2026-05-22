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
    Switch,
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
import { BlockMath } from 'react-katex';
import { IconChartLine } from '@tabler/icons-react';
import axios from '../api/axios';
import { BackButton } from '../components/BackButton';

interface PlotResponse {
    x: number[];
    f: (number | null)[];
    df: (number | null)[] | null;
    integral: (number | null)[] | null;
    derivative_latex: string | null;
    integral_latex: string | null;
}

export function PlotterPage() {
    const [expression, setExpression] = useState('sin(x) / x');
    const [variable, setVariable] = useState('x');
    const [xMin, setXMin] = useState<number>(-10);
    const [xMax, setXMax] = useState<number>(10);
    const [points, setPoints] = useState<number>(200);
    const [showDerivative, setShowDerivative] = useState(true);
    const [showIntegral, setShowIntegral] = useState(true);

    const [data, setData] = useState<PlotResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const build = async () => {
        if (!expression.trim()) {
            setError('Введите функцию');
            return;
        }
        if (xMax <= xMin) {
            setError('x_max должен быть больше x_min');
            return;
        }
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const response = await axios.post<PlotResponse>('/plotter', {
                expression,
                variable,
                x_min: xMin,
                x_max: xMax,
                points,
                include_derivative: showDerivative,
                include_integral: showIntegral,
            });
            setData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка построения графика');
        } finally {
            setLoading(false);
        }
    };

    // recharts требует массив объектов
    const chartData = data
        ? data.x.map((x, i) => ({
              x,
              f: data.f[i] ?? null,
              df: data.df ? data.df[i] ?? null : null,
              integral: data.integral ? data.integral[i] ?? null : null,
          }))
        : [];

    return (
        <Container size="lg" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />
            <BackButton />
            <Title order={2} mb="md" ta="center">
                Плоттер функций
            </Title>

            <Paper shadow="sm" p="md" withBorder mb="md">
                <Stack gap="md">
                    <TextInput
                        label="Функция f(x)"
                        placeholder="sin(x) / x"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                    />
                    <Group grow>
                        <TextInput
                            label="Переменная"
                            value={variable}
                            onChange={(e) => setVariable(e.target.value)}
                        />
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
                            label="Точек"
                            min={10}
                            max={2000}
                            value={points}
                            onChange={(v) => setPoints(Number(v) || 200)}
                        />
                    </Group>
                    <Group>
                        <Switch
                            label="Показать производную"
                            checked={showDerivative}
                            onChange={(e) => setShowDerivative(e.currentTarget.checked)}
                        />
                        <Switch
                            label="Показать первообразную"
                            checked={showIntegral}
                            onChange={(e) => setShowIntegral(e.currentTarget.checked)}
                        />
                    </Group>
                    <Button
                        onClick={build}
                        leftSection={<IconChartLine size={16} />}
                    >
                        Построить
                    </Button>
                    {error && <Alert title="Ошибка" color="red">{error}</Alert>}
                </Stack>
            </Paper>

            {data && (
                <Paper shadow="sm" p="md" withBorder>
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
                                    formatter={(v: any) => (v === null ? '—' : Number(v).toFixed(4))}
                                    labelFormatter={(v) => `x = ${Number(v).toFixed(4)}`}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="f"
                                    name="f(x)"
                                    stroke="#228be6"
                                    dot={false}
                                    connectNulls={false}
                                />
                                {data.df && (
                                    <Line
                                        type="monotone"
                                        dataKey="df"
                                        name="f'(x)"
                                        stroke="#fa5252"
                                        dot={false}
                                        connectNulls={false}
                                    />
                                )}
                                {data.integral && (
                                    <Line
                                        type="monotone"
                                        dataKey="integral"
                                        name="∫f(x)dx"
                                        stroke="#40c057"
                                        dot={false}
                                        connectNulls={false}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {(data.derivative_latex || data.integral_latex) && (
                        <Stack gap="xs" mt="md">
                            {data.derivative_latex && (
                                <div>
                                    <Text size="sm" c="dimmed">Производная:</Text>
                                    <BlockMath math={data.derivative_latex} />
                                </div>
                            )}
                            {data.integral_latex && (
                                <div>
                                    <Text size="sm" c="dimmed">Первообразная:</Text>
                                    <BlockMath math={data.integral_latex} />
                                </div>
                            )}
                        </Stack>
                    )}
                </Paper>
            )}
        </Container>
    );
}
