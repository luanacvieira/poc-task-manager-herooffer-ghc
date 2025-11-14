
import React, { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import axios from 'axios';

interface Task {
    _id: string;
    title: string;
    completed: boolean;
    userId: string;
}

const Home = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/api/tasks');
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    }, []);

    const deleteTask = async (id: string) => {
        try {
            await axios.delete(`/api/tasks/${id}`);
            setTasks(tasks.filter(task => task._id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div>
            <h1>Task Manager</h1>
            <TaskForm />
            <ul>
                {tasks.map(task => (
                    <li key={task._id}>
                        {task.title}
                        <button onClick={() => deleteTask(task._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
