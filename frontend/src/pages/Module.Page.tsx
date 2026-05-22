import { useParams, useNavigate } from 'react-router-dom';
import { EngineerCalculatorPage } from './EngineerCalculator.Page';
import { MatrixCalculatorPage } from './MatrixCalculator.Page';
import { ImageConverterPage } from './ImageConverter.Page';
import { PdfConverterPage } from './PdfConverter.Page';
import { DocxConverterPage } from './DocxConverter.Page';
import { IntegralCalculatorPage } from './IntegralCalculator.Page';
import { DerivativeCalculatorPage } from './DerivativeCalculator.Page';
import { OdeSolverPage } from './OdeSolver.Page';

export function ModulePage() {
    const { modulePath } = useParams<{ modulePath: string }>();
    const navigate = useNavigate();

    switch (modulePath) {
        case 'engineer-calculator':
            return <EngineerCalculatorPage />;
        case 'image-converter':
            return <ImageConverterPage />;
        case 'pdf-converter':
            return <PdfConverterPage />;
        case 'matrix-calculator':
            return <MatrixCalculatorPage />;
        case 'docx-converter':
            return <DocxConverterPage />;
        case 'integral-calculator':
            return <IntegralCalculatorPage />;
        case 'derivative-calculator':
            return <DerivativeCalculatorPage />;
        case 'ode-solver':
            return <OdeSolverPage />;
        default:
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Модуль не найден</h2>
                    <button onClick={() => navigate('/')}>Вернуться на главную</button>
                </div>
            );
    }
}
