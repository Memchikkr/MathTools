import { useState } from 'react';
import {
    Container,
    Title,
    Paper,
    Stack,
    Group,
    FileInput,
    Select,
    Button,
    Text,
    Alert,
    LoadingOverlay,
} from '@mantine/core';
import { IconFileTypePdf, IconDownload, IconFolderDown } from '@tabler/icons-react';
import axios from '../api/axios';
import { saveBlob, saveBlobToDownloads } from '../api/saveFile';
import { showSavedNotification } from '../api/saveFile.notify';
import { BackButton } from '../components/BackButton';

type SaveFn = (blob: Blob, filename: string) => Promise<string | null>;

export function PdfConverterPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [pageSize, setPageSize] = useState<string>('auto');
    const [fit, setFit] = useState<string>('into');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pageSizes = [
        { value: 'auto', label: 'Авто (размер изображения)' },
        { value: 'A4', label: 'A4' },
        { value: 'letter', label: 'Letter' },
        { value: 'legal', label: 'Legal' },
        { value: 'A3', label: 'A3' },
        { value: 'A5', label: 'A5' },
        { value: 'B5', label: 'B5' },
    ];

    const fitModes = [
        { value: 'into', label: 'Вписать в страницу' },
        { value: 'fill', label: 'Заполнить страницу (обрезать)' },
        { value: 'shrink', label: 'Уменьшить, если больше страницы' },
        { value: 'exact', label: 'Точный размер (без масштабирования)' },
    ];

    const handleConvert = async (saveFn: SaveFn) => {
        if (files.length === 0) {
            setError('Выберите хотя бы одно изображение');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('page_size', pageSize);
        formData.append('fit', fit);

        try {
            const response = await axios.post('/pdf-converter', formData, {
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
            setError(err.response?.data?.detail || 'Ошибка при создании PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="md" py="xl" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />

            <BackButton />

            <Title order={2} mb="md" ta="center">
                Конвертер изображений в PDF
            </Title>

            <Paper shadow="sm" p="md" withBorder>
                <Stack gap="md">
                    <FileInput
                        label="Изображения"
                        description="Порядок загрузки определит порядок страниц в PDF"
                        placeholder="Выберите изображения"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff,image/x-icon,image/svg+xml"
                        value={files}
                        onChange={(payload) => setFiles(payload || [])}
                        leftSection={<IconFileTypePdf size={16} />}
                        clearable
                    />
                    {files.length > 0 && (
                        <Text size="sm" c="dimmed">
                            Выбрано файлов: {files.length}
                        </Text>
                    )}

                    <Select
                        label="Размер страницы"
                        data={pageSizes}
                        value={pageSize}
                        onChange={(val) => setPageSize(val || 'auto')}
                    />

                    <Select
                        label="Режим вписывания"
                        data={fitModes}
                        value={fit}
                        onChange={(val) => setFit(val || 'into')}
                    />

                    <Group grow>
                        <Button
                            onClick={() => handleConvert(saveBlob)}
                            loading={loading}
                            leftSection={<IconDownload size={16} />}
                        >
                            Сохранить как…
                        </Button>
                        <Button
                            onClick={() => handleConvert(saveBlobToDownloads)}
                            loading={loading}
                            leftSection={<IconFolderDown size={16} />}
                            variant="light"
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
