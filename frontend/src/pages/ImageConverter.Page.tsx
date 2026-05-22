import { useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Stack,
  Group,
  FileInput,
  Select,
  Slider,
  Button,
  Text,
  Alert,
  LoadingOverlay,
} from '@mantine/core';
import { IconDownload, IconFolderDown, IconPhoto } from '@tabler/icons-react';
import axios from '../api/axios';
import { saveBlob, saveBlobToDownloads } from '../api/saveFile';
import { showSavedNotification } from '../api/saveFile.notify';
import { BackButton } from '../components/BackButton';

type SaveFn = (blob: Blob, filename: string) => Promise<string | null>;

export function ImageConverterPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('png');
  const [quality, setQuality] = useState<number>(95);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Доступные форматы (совпадают с бэкендом)
  const outputFormats = [
    { value: 'jpg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
    { value: 'bmp', label: 'BMP' },
    { value: 'tiff', label: 'TIFF' },
    { value: 'ico', label: 'ICO' },
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
    formData.append('target_format', targetFormat);
    formData.append('quality', quality.toString());
    formData.append('background_color', 'white');

    try {
      const response = await axios.post('/image-converter', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = `converted_${targetFormat}.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      const blob = new Blob([response.data], { type: 'application/zip' });
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
        Конвертер изображений
      </Title>

      <Paper shadow="sm" p="md" withBorder>
        <Stack gap="lg">
          <FileInput
            label="Изображения"
            description="Поддерживаются JPG, PNG, WEBP, BMP, TIFF, ICO"
            placeholder="Выберите файлы"
            multiple
            accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff,image/x-icon"
            value={files}
            onChange={(payload) => setFiles(payload || [])}
            leftSection={<IconPhoto size={16} />}
            clearable
          />
          {files.length > 0 && (
            <Text size="sm" c="dimmed">
              Выбрано файлов: {files.length}
            </Text>
          )}

          <Select
            label="Целевой формат"
            data={outputFormats}
            value={targetFormat}
            onChange={(val) => setTargetFormat(val || 'png')}
          />

          {targetFormat === 'jpg' || targetFormat === 'webp' ? (
            <Slider
              label="Качество"
              min={1}
              max={100}
              value={quality}
              onChange={setQuality}
              marks={[
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
              ]}
            />
          ) : null}

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
