import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Button,
    Textarea,
    Paper,
    Group,
    Stack,
    Text,
    Box,
    ActionIcon,
    Tooltip,
    Divider,
    LoadingOverlay,
    Alert,
} from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import axios from '../api/axios';
import { notifications } from '@mantine/notifications';
import { BackButton } from '../components/BackButton';

export function EngineerCalculatorPage() {
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Функции для быстрой вставки
    const insertFunction = (func: string) => {
        setExpression((prev) => prev + func);
    };

    const clearExpression = () => {
        setExpression('');
        setResult(null);
        setError(null);
    };

    const copyResult = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            notifications.show({
                title: 'Скопировано',
                message: 'Результат скопирован в буфер обмена',
                color: 'green',
            });
        }
    };

    const calculate = async () => {
        if (!expression.trim()) {
            setError('Введите выражение');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/calculate', {
                expression: expression,
            });
            if (response.data.error) {
                setError(response.data.error);
                setResult(null);
            } else {
                setResult(response.data.result);
                setError(null);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка соединения с сервером');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    // Математические функции для кнопок
    const mathFunctions = [
        { label: 'sin', value: 'sin(' },
        { label: 'cos', value: 'cos(' },
        { label: 'tan', value: 'tan(' },
        { label: 'asin', value: 'asin(' },
        { label: 'acos', value: 'acos(' },
        { label: 'atan', value: 'atan(' },
        { label: 'sinh', value: 'sinh(' },
        { label: 'cosh', value: 'cosh(' },
        { label: 'tanh', value: 'tanh(' },
        { label: 'log', value: 'log(' },
        { label: 'ln', value: 'ln(' },
        { label: 'sqrt', value: 'sqrt(' },
        { label: 'exp', value: 'exp(' },
        { label: 'abs', value: 'abs(' },
        { label: 'factorial', value: 'factorial(' },
    ];

    const constants = [
        { label: 'π', value: 'pi' },
        { label: 'e', value: 'e' },
    ];

    const operators = [
        { label: '+', value: '+' },
        { label: '-', value: '-' },
        { label: '*', value: '*' },
        { label: '/', value: '/' },
        { label: '^', value: '**' },
        { label: '(', value: '(' },
        { label: ')', value: ')' },
    ];

    return (
        <Container size="lg" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />

            <BackButton />

            <Title order={2} mb="md" ta="center">
                Инженерный калькулятор
            </Title>

            <Paper shadow="sm" p="md" withBorder>
                <Stack gap="md">
                    {/* Поле ввода */}
                    <Textarea
                        label="Математическое выражение"
                        placeholder="Например: sin(pi/2) + log(100) + 2^3"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                        minRows={3}
                        autosize
                        maxRows={6}
                        size="md"
                    />

                    {/* Панель быстрых кнопок */}
                    <Box>
                        <Text size="sm" fw={500} mb="xs">
                            Функции:
                        </Text>
                        <Group gap="xs" mb="md">
                            {mathFunctions.map((func) => (
                                <Tooltip key={func.label} label={func.label}>
                                    <Button
                                        variant="light"
                                        size="compact-xs"
                                        onClick={() => insertFunction(func.value)}
                                    >
                                        {func.label}
                                    </Button>
                                </Tooltip>
                            ))}
                        </Group>

                        <Text size="sm" fw={500} mb="xs">
                            Константы:
                        </Text>
                        <Group gap="xs" mb="md">
                            {constants.map((c) => (
                                <Button
                                    key={c.label}
                                    variant="light"
                                    size="compact-xs"
                                    onClick={() => insertFunction(c.value)}
                                >
                                    {c.label}
                                </Button>
                            ))}
                        </Group>

                        <Text size="sm" fw={500} mb="xs">
                            Операторы:
                        </Text>
                        <Group gap="xs" mb="md">
                            {operators.map((op) => (
                                <Button
                                    key={op.label}
                                    variant="default"
                                    size="compact-xs"
                                    onClick={() => insertFunction(op.value)}
                                >
                                    {op.label}
                                </Button>
                            ))}
                        </Group>
                    </Box>

                    <Divider />

                    {/* Кнопки действий */}
                    <Group justify="space-between">
                        <Group>
                            <Button onClick={calculate} color="blue">
                                Вычислить
                            </Button>
                            <Button onClick={clearExpression} variant="outline" color="gray">
                                Очистить
                            </Button>
                        </Group>
                        {result && (
                            <Tooltip label="Копировать результат">
                                <ActionIcon onClick={copyResult} variant="subtle" color="gray">
                                    <IconCopy size={18} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>

                    {/* Отображение результата или ошибки */}
                    {result !== null && (
                        <Paper withBorder p="md" bg="gray.9">
                            <Text size="sm" c="dimmed">
                                Результат:
                            </Text>
                            <Text fw={700} size="xl">
                                {result}
                            </Text>
                        </Paper>
                    )}

                    {error && (
                        <Alert title="Ошибка" color="red">
                            {error}
                        </Alert>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
}
