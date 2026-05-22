import { Button, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { revealInFolder } from './saveFile';

/**
 * Уведомление об успешном сохранении с полным путём и кнопкой
 * «Открыть папку». Для null-пути (отмена диалога или браузерный
 * fallback) — ничего не показывает.
 */
export function showSavedNotification(path: string | null) {
    if (!path) return;
    notifications.show({
        title: 'Сохранено',
        color: 'green',
        autoClose: 8000,
        message: (
            <Stack gap="xs">
                <Text size="xs" style={{ wordBreak: 'break-all' }}>
                    {path}
                </Text>
                <Button
                    size="xs"
                    variant="light"
                    onClick={() => revealInFolder(path)}
                >
                    Открыть папку
                </Button>
            </Stack>
        ),
    });
}
