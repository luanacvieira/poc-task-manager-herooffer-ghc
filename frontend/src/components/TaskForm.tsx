
import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = () => {
    const [title, setTitle] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.post('/api/tasks', { title, completed: false, userId: 'user1' });
        setTitle('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New Task" />
            <button type="submit">Add Task</button>
        </form>
    );
};

export default TaskForm;
