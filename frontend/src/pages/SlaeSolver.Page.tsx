import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    Group,
    NumberInput,
    Select,
    Button,
    Text,
    Alert,
    LoadingOverlay,
    Table,
    Code,
} from '@mantine/core';
import { IconMath } from '@tabler/icons-react';
import axios from '../api/axios';
import { BackButton } from '../components/BackButton';

type Matrix = number[][];

interface Step {
    description: string;
    matrix: number[][] | null;
}

interface SlaeResponse {
    solution: number[];
    condition_number: number;
    iterations: number | null;
    steps: Step[];
}

function makeMatrix(n: number, fill: (i: number, j: number) => number): Matrix {
    return Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => fill(i, j))
    );
}

const methods = [
    { value: 'gauss', label: 'Гаусс (с пошаговым выводом)' },
    { value: 'lu', label: 'LU-разложение' },
    { value: 'jacobi', label: 'Якоби (итерационный)' },
    { value: 'seidel', label: 'Гаусс-Зейдель (итерационный)' },
];

export function SlaeSolverPage() {
    const [n, setN] = useState<number>(3);
    const [A, setA] = useState<Matrix>(
        makeMatrix(3, (i, j) => (i === j ? 4 : 1))
    );
    const [b, setB] = useState<number[]>([6, 6, 6]);
    const [method, setMethod] = useState<string>('gauss');
    const [tolerance, setTolerance] = useState<number>(1e-9);
    const [maxIter, setMaxIter] = useState<number>(1000);

    const [result, setResult] = useState<SlaeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const resize = (newN: number) => {
        if (newN < 2 || newN > 8) return;
        setN(newN);
        setA(makeMatrix(newN, (i, j) =>
            i < A.length && j < A.length ? A[i][j] : i === j ? 1 : 0
        ));
        setB(
            Array.from({ length: newN }, (_, i) => (i < b.length ? b[i] : 0))
        );
    };

    const setAElement = (i: number, j: number, v: number) => {
        const next = A.map((row) => [...row]);
        next[i][j] = v;
        setA(next);
    };

    const setBElement = (i: number, v: number) => {
        const next = [...b];
        next[i] = v;
        setB(next);
    };

    const solve = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await axios.post<SlaeResponse>('/slae-solve', {
                matrix_a: A,
                vector_b: b,
                method,
                tolerance,
                max_iterations: maxIter,
            });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка решения системы');
        } finally {
            setLoading(false);
        }
    };

    const isIterative = method === 'jacobi' || method === 'seidel';

    return (
        <Container size="lg" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />
            <BackButton />
            <Title order={2} mb="md" ta="center">
                Решатель СЛАУ Ax = b
            </Title>

            <Paper shadow="sm" p="md" withBorder mb="md">
                <Stack gap="md">
                    <Group>
                        <NumberInput
                            label="Размер системы n"
                            min={2}
                            max={8}
                            value={n}
                            onChange={(v) => resize(Number(v) || 2)}
                            w={140}
                        />
                        <Select
                            label="Метод"
                            data={methods}
                            value={method}
                            onChange={(v) => setMethod(v || 'gauss')}
                            w={280}
                        />
                        {isIterative && (
                            <>
                                <NumberInput
                                    label="Точность"
                                    value={tolerance}
                                    onChange={(v) => setTolerance(Number(v) || 1e-9)}
                                    step={1e-6}
                                    decimalScale={12}
                                    w={140}
                                />
                                <NumberInput
                                    label="Макс. итераций"
                                    value={maxIter}
                                    onChange={(v) => setMaxIter(Number(v) || 1000)}
                                    min={1}
                                    w={140}
                                />
                            </>
                        )}
                    </Group>

                    <Text size="sm" fw={500}>Матрица A и вектор b:</Text>
                    <Table withColumnBorders withRowBorders>
                        <tbody>
                            {A.map((row, i) => (
                                <tr key={i}>
                                    {row.map((value, j) => (
                                        <td key={j}>
                                            <NumberInput
                                                value={value}
                                                onChange={(v) =>
                                                    setAElement(i, j, Number(v) || 0)
                                                }
                                                hideControls
                                                size="xs"
                                                styles={{ input: { textAlign: 'center', width: 80 } }}
                                            />
                                        </td>
                                    ))}
                                    <td style={{ padding: '0 8px', fontWeight: 700 }}>=</td>
                                    <td>
                                        <NumberInput
                                            value={b[i]}
                                            onChange={(v) => setBElement(i, Number(v) || 0)}
                                            hideControls
                                            size="xs"
                                            styles={{ input: { textAlign: 'center', width: 80 } }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Button onClick={solve} leftSection={<IconMath size={16} />}>
                        Решить
                    </Button>
                    {error && <Alert title="Ошибка" color="red">{error}</Alert>}
                </Stack>
            </Paper>

            {result && (
                <Paper shadow="sm" p="md" withBorder>
                    <Stack gap="md">
                        <div>
                            <Text size="sm" c="dimmed">Решение x:</Text>
                            <Code block>
                                {result.solution
                                    .map((v, i) => `x${i + 1} = ${v.toPrecision(8)}`)
                                    .join('\n')}
                            </Code>
                        </div>
                        <Group>
                            <Text size="sm">
                                Число обусловленности κ(A) ={' '}
                                <Code>{result.condition_number.toPrecision(6)}</Code>
                            </Text>
                            {result.iterations !== null && (
                                <Text size="sm">
                                    Итераций: <Code>{result.iterations}</Code>
                                </Text>
                            )}
                        </Group>
                        {result.steps.length > 0 && (
                            <div>
                                <Text size="sm" fw={500} mb="xs">Шаги:</Text>
                                <Stack gap="sm">
                                    {result.steps.map((step, idx) => (
                                        <Paper key={idx} withBorder p="sm">
                                            <Text size="sm" mb={step.matrix ? 'xs' : 0}>
                                                {idx + 1}. {step.description}
                                            </Text>
                                            {step.matrix && (
                                                <Table withColumnBorders withRowBorders>
                                                    <tbody>
                                                        {step.matrix.map((row, ri) => (
                                                            <tr key={ri}>
                                                                {row.map((c, ci) => (
                                                                    <td
                                                                        key={ci}
                                                                        style={{
                                                                            padding: '4px 10px',
                                                                            textAlign: 'right',
                                                                            fontVariantNumeric: 'tabular-nums',
                                                                        }}
                                                                    >
                                                                        {Number(c).toFixed(4)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            )}
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
