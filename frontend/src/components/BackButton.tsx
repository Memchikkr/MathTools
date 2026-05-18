import { Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export function BackButton() {
    const navigate = useNavigate();

    return <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate('/')}
        mb="md"
    >
        Назад к модулям
    </Button>
}