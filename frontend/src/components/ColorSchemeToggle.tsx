import { Button, Group, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <Group justify="right">
      <Button variant='default' onClick={() => setColorScheme('light')}><IconSun /></Button>
      <Button variant='default' onClick={() => setColorScheme('dark')}><IconMoon /></Button>
    </Group>
  );
}
