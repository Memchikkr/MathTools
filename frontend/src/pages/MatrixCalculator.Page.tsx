import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    Group,
    Button,
    Select,
    NumberInput,
    Table,
    Text,
    Alert,
    Grid,
    ActionIcon,
    LoadingOverlay,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import axios from '../api/axios';
import { BackButton } from '../components/BackButton';

// Типы для матриц
type Matrix = (number | string)[][];

// Доступные операции
const OPERATIONS = [
    { value: 'add', label: 'Сложение (A + B)' },
    { value: 'subtract', label: 'Вычитание (A - B)' },
    { value: 'multiply', label: 'Умножение (A * B)' },
    { value: 'transpose', label: 'Транспонирование (Aᵀ)' },
    { value: 'determinant', label: 'Определитель |A|' },
    { value: 'inverse', label: 'Обратная матрица A⁻¹' },
    { value: 'eigen', label: 'Собственные значения и векторы' },
];

export function MatrixCalculatorPage() {
    const [matrixA, setMatrixA] = useState<Matrix>([[1, 2], [3, 4]]);
    const [matrixB, setMatrixB] = useState<Matrix>([[5, 6], [7, 8]]);
    const [operation, setOperation] = useState<string>('add');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleMatrixChange = (
        setter: React.Dispatch<React.SetStateAction<Matrix>>,
        matrix: Matrix,
        row: number,
        col: number,
        value: string
    ) => {
        const newMatrix = [...matrix];
        newMatrix[row][col] = value === '' ? 0 : Number(value);
        setter(newMatrix);
    };

    const addRow = (setter: React.Dispatch<React.SetStateAction<Matrix>>, matrix: Matrix) => {
        const newRow = Array(matrix[0]?.length || 1).fill(0);
        setter([...matrix, newRow]);
    };

    const addCol = (setter: React.Dispatch<React.SetStateAction<Matrix>>, matrix: Matrix) => {
        const newMatrix = matrix.map(row => [...row, 0]);
        setter(newMatrix);
    };

    const removeRow = (setter: React.Dispatch<React.SetStateAction<Matrix>>, matrix: Matrix, rowIndex: number) => {
        if (matrix.length > 1) {
            const newMatrix = matrix.filter((_, idx) => idx !== rowIndex);
            setter(newMatrix);
        }
    };

    const removeCol = (setter: React.Dispatch<React.SetStateAction<Matrix>>, matrix: Matrix, colIndex: number) => {
        if (matrix[0]?.length > 1) {
            const newMatrix = matrix.map(row => row.filter((_, idx) => idx !== colIndex));
            setter(newMatrix);
        }
    };

    // Отображение матрицы в виде таблицы
    const renderMatrixInput = (
        matrix: Matrix,
        setter: React.Dispatch<React.SetStateAction<Matrix>>,
        title: string
    ) => {
        const rows = matrix.length;
        const cols = matrix[0]?.length || 1;

        return (
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <Title order={4}>{title}</Title>
                    <Group gap="xs">
                        <Button size="xs" variant="light" onClick={() => addRow(setter, matrix)}>
                            + Строка
                        </Button>
                        <Button size="xs" variant="light" onClick={() => addCol(setter, matrix)}>
                            + Столбец
                        </Button>
                    </Group>
                </Group>
                <div style={{ overflowX: 'auto' }}>
                    <Table withColumnBorders withRowBorders>
                        <thead>
                            <tr>
                                {Array(cols)
                                    .fill(null)
                                    .map((_, col) => (
                                        <th key={col} style={{ minWidth: 80 }}>
                                            <Group justify="left">
                                                <span>Столбец {col + 1}</span>
                                                {cols > 1 && (
                                                    <ActionIcon
                                                        size="xs"
                                                        color="red"
                                                        variant="subtle"
                                                        onClick={() => removeCol(setter, matrix, col)}
                                                    >
                                                        <IconX size={12} />
                                                    </ActionIcon>
                                                )}
                                            </Group>
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                    {row.map((value, colIdx) => (
                                        <td key={colIdx}>
                                            <NumberInput
                                                value={value}
                                                onChange={(val) =>
                                                    handleMatrixChange(setter, matrix, rowIdx, colIdx, String(val))
                                                }
                                                hideControls
                                                size="xs"
                                                styles={{ input: { textAlign: 'center', width: '100%' } }}
                                            />
                                        </td>
                                    ))}
                                    <td>
                                        {rows > 1 && (
                                            <ActionIcon
                                                size="xs"
                                                color="red"
                                                variant="subtle"
                                                onClick={() => removeRow(setter, matrix, rowIdx)}
                                            >
                                                <IconX size={12} />
                                            </ActionIcon>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Paper>
        );
    };

    // Отображение результата (матрица или число)
    const renderResult = () => {
        if (error) {
            return <Alert title="Ошибка" color="red">{error}</Alert>;
        }
        if (result === null || result === undefined) return null;

        if (typeof result === 'number') {
            return (
                <Paper withBorder p="md" bg="var(--mantine-color-default-hover)">
                    <Text size="sm" c="dimmed">Результат:</Text>
                    <Text fw={700} size="xl">{result}</Text>
                </Paper>
            );
        }

        if (Array.isArray(result) && result.length > 0) {
            // Для собственных значений и векторов
            // if (result.eigenvalues) {
            //     return (
            //         <Stack gap="md">
            //             <Paper withBorder p="md">
            //                 <Text fw={500} mb="xs">Собственные значения:</Text>
            //                 {result.eigenvalues.map((val: any, idx: number) => (
            //                     <Text key={idx}>{val}</Text>
            //                 ))}
            //             </Paper>
            //             <Paper withBorder p="md">
            //                 <Text fw={500} mb="xs">Собственные векторы:</Text>
            //                 {result.eigenvectors.map((vec: any[], idx: number) => (
            //                     <div key={idx}>
            //                         <Text size="sm" c="dimmed">Вектор {idx + 1}:</Text>
            //                         <Text>[{vec.join(', ')}]</Text>
            //                     </div>
            //                 ))}
            //             </Paper>
            //         </Stack>
            //     );
            // }

            // Обычная матрица
            return (
                <Paper withBorder p="md">
                    <Text size="sm" c="dimmed" mb="xs">Результат (матрица):</Text>
                    <div style={{ overflowX: 'auto' }}>
                        <Table withColumnBorders withRowBorders>
                            <tbody>
                                {result.map((row: any[], i: number) => (
                                    <tr key={i}>
                                        {row.map((cell, j) => (
                                            <td key={j} style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                {typeof cell === 'number' ? cell.toFixed(4) : cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Paper>
            );
        }

        return <Text>Некорректный результат</Text>;
    };

    // Обработка вычисления (заглушка)
    const calculate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const payload: any = { matrix_a: matrixA, operation };
            if (operation !== 'transpose' && operation !== 'determinant' && operation !== 'inverse' && operation !== 'eigen') {
                payload.matrix_b = matrixB;
            }
            const response = await axios.post('/matrix-calculate', payload);
            if (response.data.error) {
                setError(response.data.error);
            } else {
                setResult(response.data.result);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    // Определяем, нужна ли вторая матрица
    const needsMatrixB = !['transpose', 'determinant', 'inverse', 'eigen'].includes(operation);

    return (
        <Container size="xl" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />

            <BackButton />

            <Title order={2} mb="md" ta="center">
                Матричный калькулятор
            </Title>

            <Grid gap="md">
                <Grid.Col span={{ base: 12, md: needsMatrixB ? 6 : 12 }}>
                    {renderMatrixInput(matrixA, setMatrixA, 'Матрица A')}
                </Grid.Col>
                {needsMatrixB && (
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        {renderMatrixInput(matrixB, setMatrixB, 'Матрица B')}
                    </Grid.Col>
                )}
            </Grid>

            <Paper withBorder p="md" mt="md">
                <Stack gap="md">
                    <Select
                        label="Операция"
                        data={OPERATIONS}
                        value={operation}
                        onChange={(val) => setOperation(val || 'add')}
                        size="md"
                    />
                    <Button onClick={calculate} size="md" fullWidth>
                        Вычислить
                    </Button>
                </Stack>
            </Paper>

            {renderResult()}
        </Container>
    );
}
