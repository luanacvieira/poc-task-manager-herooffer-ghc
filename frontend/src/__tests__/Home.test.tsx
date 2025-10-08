import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Home from '../pages/Home';
import axios from 'axios';
import { Task } from '../services/api';
// Tipagem segura para axios mockado
const mockedAxios = axios as unknown as {
    get: jest.Mock<Promise<{ data: Task[] }>, unknown[]>;
    put: jest.Mock<Promise<{ data: Partial<Task> }>, unknown[]>;
    delete: jest.Mock<Promise<{ data: unknown }>, unknown[]>;
};

// Mock do TaskForm component
jest.mock('../components/TaskForm', () => {
    return function MockTaskForm({ onTaskAdded: _onTaskAdded }: { onTaskAdded: () => void }) {
        // TESTE PARA FALHAR: Botão de "Add Task" removido de propósito.
        // Efeito esperado: o teste "should refresh tasks when TaskForm triggers onTaskAdded" irá falhar
        // porque ele tenta localizar e clicar no botão 'Add Task' para provocar nova chamada de GET.
        // Sem o botão, o fluxo de onTaskAdded nunca é disparado e o expect de chamadas (Times 2) falha.
        // Nota: renomeado para _onTaskAdded para evitar erro de lint (no-unused-vars) — queremos a falha só no teste, não no step de lint.
        return (
            <div data-testid="task-form">
                {/* Botão removido intencionalmente */}
                <span>Form Mock Sem Botão</span>
            </div>
        );
    };
});

const mockTasks: Task[] = [
    {
        _id: '1',
        title: 'Task 1',
        description: 'Description 1',
        completed: false,
        priority: 'high' as const,
        dueDate: '2024-12-31',
        category: 'work',
        tags: ['importante', 'urgente'],
        createdAt: '2024-01-01T00:00:00.000Z',
        assignedTo: 'user1'
    },
    {
        _id: '2',
        title: 'Task 2',
        description: 'Description 2',
        completed: true,
        priority: 'medium' as const,
        dueDate: undefined,
        category: 'personal',
        tags: ['pessoal'],
        createdAt: '2024-01-02T00:00:00.000Z',
        assignedTo: 'user1'
    }
];

describe('Home Component Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render loading state initially', () => {
        // Never resolves promise to simulate loading state; donor executor logs to avoid empty fn lint
        mockedAxios.get.mockImplementation(() => new Promise(() => { /* intentional noop to keep pending */ }));
        
        render(<Home />);
        
        expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });

    test('should render tasks after loading', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockTasks });
        
        render(<Home />);
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
        
        expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });

    test('should display task details correctly', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockTasks });
        const dueBase = new Date('2024-12-31');
        const possibleDueDates = [
            dueBase.toLocaleDateString('pt-BR'),
            new Date(dueBase.getTime() - 24*60*60*1000).toLocaleDateString('pt-BR') // fallback -1 dia (timezone)
        ];
        const createdBase = new Date('2024-01-01T00:00:00.000Z');
        const possibleCreatedDates = [
            createdBase.toLocaleDateString('pt-BR'),
            new Date(createdBase.getTime() - 24*60*60*1000).toLocaleDateString('pt-BR')
        ];

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Description 1')).toBeInTheDocument();
            expect(screen.getByText(/work/i)).toBeInTheDocument();
            // Verifica se algum dos formatos possíveis aparece
            expect(screen.getByText((content) => possibleDueDates.some(d => content.includes(d)))).toBeInTheDocument();
            expect(screen.getByText('high')).toBeInTheDocument();
            expect(screen.getByText((content) => possibleCreatedDates.some(d => content.includes(d)))).toBeInTheDocument();
        });
    });

    test('should render TaskForm component', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });
        
        render(<Home />);
        
        await waitFor(() => {
            expect(screen.getByTestId('task-form')).toBeInTheDocument();
        });
    });

    test('should handle task completion toggle', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockTasks });
        mockedAxios.put.mockResolvedValueOnce({ data: {} });
        mockedAxios.get.mockResolvedValueOnce({ data: [...mockTasks] }); // Second call after update
        
        render(<Home />);
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });
        
        // Encontrar e clicar no checkbox da primeira task (não completada)
        const checkboxes = screen.getAllByRole('checkbox');
        const firstCheckbox = checkboxes[0];
        
        await userEvent.click(firstCheckbox);
        
        await waitFor(() => {
            expect(mockedAxios.put).toHaveBeenCalledWith('/api/tasks/1', { completed: true });
        });
        
        // Verificar se fetchTasks foi chamado novamente
        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });
    });

    test('should handle delete task', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockTasks });
        mockedAxios.delete.mockResolvedValueOnce({ data: {} });
        mockedAxios.get.mockResolvedValueOnce({ data: [mockTasks[1]] }); // After deletion
        // Mock confirm
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        // Botão de deletar é apenas o emoji 🗑️
        const deleteButtons = screen.getAllByRole('button', { name: /🗑️/ });
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tasks/1');
        });

        await waitFor(() => {
            // 1ª chamada load inicial, 2ª após delete
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });
        confirmSpy.mockRestore();
    });

    test('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((..._args: unknown[]) => { /* swallow error log */ });
        mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
        
        render(<Home />);
        
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao carregar tasks:', expect.any(Error));
        });
        
        // Loading deve parar mesmo com erro
        await waitFor(() => {
            expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
        });
        
        consoleErrorSpy.mockRestore();
    });

    test('should refresh tasks when TaskForm triggers onTaskAdded', async () => {
        mockedAxios.get.mockResolvedValue({ data: mockTasks });
        
        render(<Home />);
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });
        
        // Simular adição de task através do TaskForm mock
        const addTaskButton = screen.getByText('Add Task');
        await userEvent.click(addTaskButton);
        
        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Initial load + refresh after add
        });
    });

    test('should display empty state when no tasks', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });
        
        render(<Home />);
        
        await waitFor(() => {
            expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
        });
        
        // Verificar se não há tasks sendo exibidas
        expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    test('should display task tags correctly', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockTasks });
        const { container } = render(<Home />);

        await waitFor(() => {
            const tagElements = container.querySelectorAll('.tag');
            const tagsText = Array.from(tagElements).map(el => el.textContent?.replace(/\s/g,'') || '');
            expect(tagsText).toEqual(expect.arrayContaining(['#importante', '#urgente', '#pessoal']));
        });
    });

    test('should handle toggle completion errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((..._args: unknown[]) => { /* noop */ });
        mockedAxios.get.mockResolvedValueOnce({ data: mockTasks });
        mockedAxios.put.mockRejectedValueOnce(new Error('Update failed'));
        
        render(<Home />);
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });
        
        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);
        
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar task:', expect.any(Error));
        });
        
        consoleErrorSpy.mockRestore();
    });

    test('should handle delete task errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((..._args: unknown[]) => { /* noop */ });
        mockedAxios.get.mockResolvedValueOnce({ data: mockTasks });
        mockedAxios.delete.mockRejectedValueOnce(new Error('Delete failed'));
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole('button', { name: /🗑️/ });
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao excluir task:', expect.any(Error));
        });

        consoleErrorSpy.mockRestore();
        confirmSpy.mockRestore();
    });
});