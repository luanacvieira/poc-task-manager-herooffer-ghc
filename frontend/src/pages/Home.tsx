
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TaskForm from '../components/TaskForm';

const Home = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        };
        fetchTasks();
    }, []);

    return (
        <div>
            <h1>Task Manager</h1>
            <TaskForm />
            <ul>
                {tasks.map((task: any) => (
                    <li key={task._id}>{task.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
