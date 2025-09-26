// src/setupTests.ts
import '@testing-library/jest-dom';

// Mock global do axios para evitar problemas de ES modules
jest.mock('axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(() => Promise.resolve({ data: {} })),
        post: jest.fn(() => Promise.resolve({ data: {} })),
        put: jest.fn(() => Promise.resolve({ data: {} })),
        delete: jest.fn(() => Promise.resolve({ data: {} })),
    },
    create: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ data: {} })),
        post: jest.fn(() => Promise.resolve({ data: {} })),
        put: jest.fn(() => Promise.resolve({ data: {} })),
        delete: jest.fn(() => Promise.resolve({ data: {} })),
    })),
}));

// Mock do console para testes mais limpos
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render is deprecated') ||
            args[0].includes('Warning: An invalid form control') ||
            args[0].includes('`ReactDOMTestUtils.act` is deprecated') ||
            // Suprimir warnings de act() para reduzir ruído enquanto os testes já
            // utilizam user-event que envolve internamente updates assíncronos.
            args[0].includes('Warning: An update to') && args[0].includes('was not wrapped in act'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };

    console.warn = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('componentWillReceiveProps has been renamed')
        ) {
            return;
        }
        originalWarn.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});