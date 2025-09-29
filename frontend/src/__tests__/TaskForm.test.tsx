import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TaskForm from '../components/TaskForm';
import * as api from '../services/api';
import { Task } from '../services/api';
import type { AxiosResponse } from 'axios';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('TaskForm Component Tests', () => {
    const mockOnTaskAdded = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock successful API response
    const mockResponse = {
        data: {
            _id: '1',
            title: 'Test Task',
            description: 'Desc',
            completed: false,
            priority: 'medium',
            dueDate: null,
            category: 'other',
            tags: [],
            assignedTo: 'user1'
        }
    } as unknown as AxiosResponse<Task>;
    mockedApi.createTask.mockResolvedValue(mockResponse);
    });

    test('should render form elements correctly', () => {
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        // Verificar se elementos estão presentes
        expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/prioridade/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/data limite/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();
    });

    test('should update input values when typing', async () => {
        const user = userEvent.setup();
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        const titleInput = screen.getByLabelText(/título/i);
        const descriptionInput = screen.getByLabelText(/descrição/i);

        await user.type(titleInput, 'Nova tarefa');
        await user.type(descriptionInput, 'Descrição da tarefa');

        expect(titleInput).toHaveValue('Nova tarefa');
        expect(descriptionInput).toHaveValue('Descrição da tarefa');
    });

    test('should handle select changes for priority and category', async () => {
        const user = userEvent.setup();
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        const prioritySelect = screen.getByLabelText(/prioridade/i);
        const categorySelect = screen.getByLabelText(/categoria/i);

        await user.selectOptions(prioritySelect, 'high');
        await user.selectOptions(categorySelect, 'work');

        expect(prioritySelect).toHaveValue('high');
        expect(categorySelect).toHaveValue('work');
    });

    test('should submit form with correct data', async () => {
        const user = userEvent.setup();
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        // Preencher formulário
        await user.type(screen.getByLabelText(/título/i), 'Test Task');
        await user.type(screen.getByLabelText(/descrição/i), 'Test Description');
        await user.selectOptions(screen.getByLabelText(/prioridade/i), 'high');
        await user.selectOptions(screen.getByLabelText(/categoria/i), 'work');
        await user.type(screen.getByLabelText(/tags/i), 'teste, importante');

        // Submeter formulário
        await user.click(screen.getByRole('button', { name: /adicionar/i }));

        await waitFor(() => {
            expect(mockedApi.createTask).toHaveBeenCalledWith({
                title: 'Test Task',
                description: 'Test Description',
                priority: 'high',
                dueDate: null,
                category: 'work',
                tags: ['teste', 'importante'],
                completed: false,
                assignedTo: 'user1',
                userId: 'user1'
            });
        });

        expect(mockOnTaskAdded).toHaveBeenCalledTimes(1);
    });

    test('should not submit form with empty title', async () => {
        const user = userEvent.setup();
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        // Tentar submeter sem título
        await user.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(mockedApi.createTask).not.toHaveBeenCalled();
        expect(mockOnTaskAdded).not.toHaveBeenCalled();
    });

    test('should clear form after successful submission', async () => {
        const user = userEvent.setup();
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        const titleInput = screen.getByLabelText(/título/i);
        const descriptionInput = screen.getByLabelText(/descrição/i);

        // Preencher e submeter
        await user.type(titleInput, 'Test Task');
        await user.type(descriptionInput, 'Test Description');
        await user.click(screen.getByRole('button', { name: /adicionar/i }));

        await waitFor(() => {
            expect(titleInput).toHaveValue('');
            expect(descriptionInput).toHaveValue('');
        });
    });

    test('should handle API errors gracefully', async () => {
        const user = userEvent.setup();
        
        // Mock error response
    mockedApi.createTask.mockRejectedValueOnce(new Error('API Error'));
        
        // Mock window.alert
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        await user.type(screen.getByLabelText(/título/i), 'Test Task');
        await user.click(screen.getByRole('button', { name: /adicionar/i }));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Erro ao criar tarefa!');
        });

        expect(mockOnTaskAdded).not.toHaveBeenCalled();
        
        alertSpy.mockRestore();
    });

    test('should handle tags correctly', async () => {
        const user = userEvent.setup();
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        await user.type(screen.getByLabelText(/título/i), 'Test Task');
        await user.type(screen.getByLabelText(/tags/i), 'tag1, tag2, , tag3,');
        await user.click(screen.getByRole('button', { name: /adicionar/i }));

        await waitFor(() => {
            expect(mockedApi.createTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: ['tag1', 'tag2', 'tag3'] // Tags vazias devem ser filtradas
                })
            );
        });
    });

    test('should handle date input correctly', async () => {
        const user = userEvent.setup();
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        await user.type(screen.getByLabelText(/título/i), 'Test Task');
        
        const dateInput = screen.getByLabelText(/data limite/i);
        await user.type(dateInput, '2024-12-31');
        
        await user.click(screen.getByRole('button', { name: /adicionar/i }));

        await waitFor(() => {
            expect(mockedApi.createTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    dueDate: '2024-12-31'
                })
            );
        });
    });

    test('should validate form submission prevents empty title after trimming', async () => {
        const user = userEvent.setup();
        render(<TaskForm onTaskAdded={mockOnTaskAdded} />);

        // Preencher com espaços apenas
        await user.type(screen.getByLabelText(/título/i), '   ');
        await user.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(mockedApi.createTask).not.toHaveBeenCalled();
        expect(mockOnTaskAdded).not.toHaveBeenCalled();
    });
});