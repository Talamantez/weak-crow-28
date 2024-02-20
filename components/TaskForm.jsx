import React, { useEffect, useState } from "react";
import { TasksCollection } from '/imports/api/TasksCollection';

export default function TaskForm(){
    const [title, setTitle] = useState("");
    const [contact, setContact] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = e => {
        e.preventDefault();

        if (!title || !contact || !description) return;

        TasksCollection.insert({
            title: title.trim(),
            createdAt: new Date(),
            contact: contact.trim(),
            description: description.trim()
        });

        setTitle("");
        setContact("");
        setDescription("");
    }

    useEffect(() => {
        console.dir(TasksCollection)
    }, [TasksCollection])

    return (
        <>
            <div></div>
            <form className="task-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter a Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)
                    }
                />
                <input
                    type="text"
                    placeholder="Enter Contact Info"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)
                    }
                />
                <input
                    type="textarea"
                    placeholder="Enter Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                
                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-5">Add Resource</button>
                
           
            </form>
        </>
    )
}