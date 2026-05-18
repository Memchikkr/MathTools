import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    FileInput,
    Button,
    Text,
    Alert,
    LoadingOverlay,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFileText, IconDownload } from '@tabler/icons-react';
import axios from '../api/axios';
import { saveBlob } from '../api/saveFile';
import { BackButton } from '../components/BackButton';

export function DocxConverterPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConvert = async () => {
        if (!file) {
            setError('Выберите файл .docx');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file); // бэкенд ожидает поле "files"

        try {
            const response = await axios.post('/docx-to-pdf-converter', formData, {
                responseType: 'blob',
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Извлечение имени файла из заголовка Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'converted.pdf';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }

            const blob = new Blob([response.data], { type: 'application/pdf' });
            await saveBlob(blob, filename);
            notifications.show({
                title: 'Успех',
                message: 'Конвертация завершена',
                color: 'green',
            });
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Ошибка при конвертации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="md" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />

            <BackButton />

            <Title order={2} mb="md" ta="center">
                Конвертер DOCX в PDF
            </Title>

            <Paper shadow="sm" p="md" withBorder>
                <Stack gap="md">
                    <FileInput
                        label="Документ Word"
                        description="Поддерживаются файлы .docx"
                        placeholder="Выберите файл"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        value={file}
                        onChange={(payload) => setFile(payload)}
                        leftSection={<IconFileText size={16} />}
                        clearable
                    />
                    {file && (
                        <Text size="sm" c="dimmed">
                            Выбран файл: {file.name}
                        </Text>
                    )}

                    <Button
                        onClick={handleConvert}
                        loading={loading}
                        leftSection={<IconDownload size={16} />}
                        fullWidth
                        disabled={!file}
                    >
                        Конвертировать в PDF
                    </Button>

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
