import React from 'react';
import { TasksCollection } from '../api/TasksCollection';

export const Task = ({ task }) => {

  const runRemove = function () {
    TasksCollection.remove(task._id)
  }

  return (
    <>
      <div className="p-6 mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
        <div>
          <div className="text-xl font-medium text-black">{task.title}</div>
          <p className="text-slate-500">{task.contact}</p>
          <p className="text-x1 font-small text-black">{task.description}</p>
        </div>
      </div>
      <div>
        <button  class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={runRemove}>Remove</button>
      </div>

    </>
  )

};