
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
            const response = await axios.get('/api/tasks');
            setTasks(response.data);
        };
        fetchTasks();
    }, []);

    const deleteTask = async (id: string) => {
        await axios.delete(`/api/tasks/${id}`);
        setTasks(tasks.filter(task => task._id !== id));
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
