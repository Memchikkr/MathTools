import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    Group,
    FileInput,
    Button,
    Text,
    Alert,
    LoadingOverlay,
} from '@mantine/core';
import { IconFileText, IconDownload, IconFolderDown } from '@tabler/icons-react';
import axios from '../api/axios';
import { saveBlob, saveBlobToDownloads } from '../api/saveFile';
import { showSavedNotification } from '../api/saveFile.notify';
import { BackButton } from '../components/BackButton';

type SaveFn = (blob: Blob, filename: string) => Promise<string | null>;

export function DocxConverterPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConvert = async (saveFn: SaveFn) => {
        if (!file) {
            setError('Выберите файл .docx');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/docx-to-pdf-converter', formData, {
                responseType: 'blob',
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const contentDisposition = response.headers['content-disposition'];
            let filename = 'converted.pdf';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const path = await saveFn(blob, filename);
            showSavedNotification(path);
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

                    <Group grow>
                        <Button
                            onClick={() => handleConvert(saveBlob)}
                            loading={loading}
                            leftSection={<IconDownload size={16} />}
                            disabled={!file}
                        >
                            Сохранить как…
                        </Button>
                        <Button
                            onClick={() => handleConvert(saveBlobToDownloads)}
                            loading={loading}
                            leftSection={<IconFolderDown size={16} />}
                            variant="light"
                            disabled={!file}
                        >
                            В Загрузки
                        </Button>
                    </Group>

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
