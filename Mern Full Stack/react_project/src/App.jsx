import { useState, useEffect } from "react";
import Task from "./components/Task";
import TaskForm from "./components/TaskForm";

export default function App (){
  const [tasks, setTasks] = useState([
  {id: 1, title: "Write Lesson Plan",completed : false},
  {id: 2, title: "Review MongoDb Quiz",completed : true }])

  const toggleTask = id =>{
  setTasks (curr => curr.map (t => t.id === id ? {...t, completed: t.completed} : t))
  };
  return(
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Task Management System</h1>
      {tasks.map(task => (
        <Task key = {task.id} {...task} onToggle={toggleTask} />
      ))}
    </div>
  )
}