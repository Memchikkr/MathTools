import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    Group,
    TextInput,
    Select,
    Button,
    Alert,
    LoadingOverlay,
    Text,
    Code,
    Badge,
} from '@mantine/core';
import { IconNumber123 } from '@tabler/icons-react';
import axios from '../api/axios';
import { BackButton } from '../components/BackButton';

const operations = [
    { value: 'gcd', label: 'НОД (наибольший общий делитель)' },
    { value: 'lcm', label: 'НОК (наименьшее общее кратное)' },
    { value: 'factorize', label: 'Разложение на простые множители' },
    { value: 'is_prime', label: 'Проверка простоты' },
];

interface NumberTheoryResponse {
    operation: string;
    input: number[];
    result: any;
    result_factors?: Record<string, number> | null;
    steps: string[];
}

export function NumberTheoryPage() {
    const [numbersText, setNumbersText] = useState('12, 18');
    const [operation, setOperation] = useState<string>('gcd');

    const [result, setResult] = useState<NumberTheoryResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const parseNumbers = (text: string): number[] => {
        return text
            .split(/[,\s]+/)
            .filter((s) => s.length > 0)
            .map((s) => Number(s.trim()));
    };

    const submit = async () => {
        const nums = parseNumbers(numbersText);
        if (nums.length === 0 || nums.some((n) => !Number.isFinite(n))) {
            setError('Введите целые числа через запятую или пробел');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await axios.post<NumberTheoryResponse>('/number-theory', {
                numbers: nums.map((n) => Math.trunc(n)),
                operation,
            });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка вычисления');
        } finally {
            setLoading(false);
        }
    };

    const singleNumberOp = operation === 'factorize' || operation === 'is_prime';

    return (
        <Container size="md" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />
            <BackButton />
            <Title order={2} mb="md" ta="center">
                Теория чисел
            </Title>

            <Paper shadow="sm" p="md" withBorder mb="md">
                <Stack gap="md">
                    <Select
                        label="Операция"
                        data={operations}
                        value={operation}
                        onChange={(v) => setOperation(v || 'gcd')}
                    />
                    <TextInput
                        label={singleNumberOp ? 'Число' : 'Числа (через запятую или пробел)'}
                        placeholder={singleNumberOp ? '360' : '12, 18, 24'}
                        value={numbersText}
                        onChange={(e) => setNumbersText(e.target.value)}
                    />
                    <Button onClick={submit} leftSection={<IconNumber123 size={16} />}>
                        Вычислить
                    </Button>
                    {error && <Alert title="Ошибка" color="red">{error}</Alert>}
                </Stack>
            </Paper>

            {result && (
                <Paper shadow="sm" p="md" withBorder>
                    <Stack gap="md">
                        <Group>
                            <Text size="sm" c="dimmed">Входные данные:</Text>
                            <Code>{result.input.join(', ')}</Code>
                        </Group>

                        <div>
                            <Text size="sm" c="dimmed">Результат:</Text>
                            {result.operation === 'is_prime' ? (
                                <Badge
                                    color={result.result ? 'green' : 'red'}
                                    size="lg"
                                >
                                    {result.result ? 'Простое' : 'Составное'}
                                </Badge>
                            ) : (
                                <Text fw={700} size="xl">
                                    {String(result.result)}
                                </Text>
                            )}
                        </div>

                        {result.result_factors && (
                            <div>
                                <Text size="sm" c="dimmed" mb="xs">Простые множители:</Text>
                                <Group gap="xs">
                                    {Object.entries(result.result_factors).map(([p, e]) => (
                                        <Badge key={p} variant="light" size="lg">
                                            {p}{e > 1 ? <sup>{e}</sup> : null}
                                        </Badge>
                                    ))}
                                </Group>
                            </div>
                        )}

                        {result.steps.length > 0 && (
                            <div>
                                <Text size="sm" fw={500} mb="xs">Пояснение:</Text>
                                <Stack gap="xs">
                                    {result.steps.map((step, idx) => (
                                        <Text key={idx} size="sm">— {step}</Text>
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
