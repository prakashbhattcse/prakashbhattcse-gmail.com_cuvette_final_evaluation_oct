import React, { useState, useEffect } from "react";
import style from "./Board.module.css";
import moment from "moment";
import { CiSquareMinus } from "react-icons/ci";
import { FiPlus } from "react-icons/fi";
import TodoModal from "./TodoModal";
import {
  createTodo,
  getAllTodo,
  updateTodo,
  deleteTodo,
  getUserTodoById,
} from "../../apis/todo";
import { updateUser, getUser } from "../../apis/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "./Card";
import { PiUsers } from "react-icons/pi";

const ConfirmModal = ({ onClose, email }) => (
  <div className={style.modalSection}>
    <div
      className={style.addPeoplemodalContainer}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2 style={{ fontSize: "1.3rem" }}>{email} added to the board</h2>
      <div className={style.peopleBtnWrap}>
        <button
          className={style.saveBtn}
          onClick={onClose}
          style={{ width: "11rem" }}
        >
          Okay, Got it
        </button>
      </div>
    </div>
  </div>
);

const Board = () => {
  const [userName, setUserName] = useState("User");
  const currentDate = new Date();
  const formattedDate = moment(currentDate).format("Do MMM, YYYY");
  const [todos, setTodos] = useState([]);
  const [data, setData] = useState();
  const [refresh, setRefresh] = useState(false);
  const [modal, setModal] = useState(false);
  const [dropdown, setDropdown] = useState({});
  const [filterOption, setFilterOption] = useState("option1"); // New state for filter option
  const [addPeopleModal, setAddPeopleModal] = useState(false);

  const [modalData, setModalData] = useState({
    title: "",
    assignTo: "",
    priority: "",
    tasks: [],
    dueDate: null,
  });
  const [currentTodo, setCurrentTodo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleUpdate = async () => {
    if (newEmail) {
      setEmails((prevEmails) => [...prevEmails, newEmail]);
    }
    const userId = localStorage.getItem("userId");
    const response = await updateUser(userId, {
      emails: [...emails, newEmail],
    });

    if (response) {
      setUserEmail(newEmail);
      setConfirmModal(true);
      setAddPeopleModal(false);
    } else {
      toast.error("Failed to update email");
    }
  };

  const toggleDropdown = (index) => {
    setDropdown((prevDropdown) => ({
      ...prevDropdown,
      [index]: !prevDropdown[index],
    }));
  };

  const fetchTodos = async () => {
    try {
      const allTodos = await getAllTodo();
      setTodos(allTodos);
      console.log(allTodos);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const userData = await getUser(userId);

      setUserName(userData.data[0].name);
      setEmails(Object.values(userData.data[0].storeEmails));
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const modalInputChange = (event) => {
    setModalData({
      ...modalData,
      [event.target.name]: event.target.value,
    });
  };

  const handlePriorityClick = (selectedPriority) => {
    setModalData({ ...modalData, priority: selectedPriority });
  };

  const handleAddTask = () => {
    setModalData((prevData) => ({
      ...prevData,
      tasks: [...prevData.tasks, { text: "", completed: false }],
    }));
  };

  const handleTaskChange = (index, newText) => {
    const updatedTasks = [...modalData.tasks];
    updatedTasks[index].text = newText;
    setModalData((prevData) => ({
      ...prevData,
      tasks: updatedTasks,
    }));
  };

  const handleTaskToggle = (index) => {
    const updatedTasks = [...modalData.tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setModalData((prevData) => ({
      ...prevData,
      tasks: updatedTasks,
    }));
  };

  const handleTaskToggleMain = async (todoIndex, taskIndex) => {
    const updatedTodos = [...todos];
    updatedTodos[todoIndex].tasks[taskIndex].completed =
      !updatedTodos[todoIndex].tasks[taskIndex].completed;

    try {
      const updatedTodo = await updateTodo(updatedTodos[todoIndex]._id, {
        tasks: updatedTodos[todoIndex].tasks,
      });
      setTodos((prevTodos) =>
        prevTodos.map((todo, index) =>
          index === todoIndex ? { ...todo, tasks: updatedTodo.tasks } : todo
        )
      );
      setModal(false);
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task.");
    }
  };

  const handleSave = async () => {
    if (
      !modalData.title ||
      !modalData.priority ||
      modalData.tasks.length === 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if all tasks have text
    for (let task of modalData.tasks) {
      if (!task.text) {
        toast.error("All tasks must have text");
        return;
      }
    }
    try {
      if (isEditing) {
        console.log(modalData);
        let id = modalData._id;
        const res = await updateTodo(id, modalData);
        if (res) {
          setRefresh(true);

          toast.success("Task updated successfully");
          setModal(false);
          return;
        }
      } else {
        const newTodo = await createTodo({
          ...modalData,
          status: "Backlog",
          createdBy: localStorage.getItem("userId"),
          createdAt: new Date(),
        });
        setTodos([...todos, newTodo]); // Update todos state here
        console.log(todos);
        toast.success("Task created successfully");
      }

      setModal(false);
      setModalData({
        title: "",
        assignTo: "",
        priority: "",
        tasks: [],
        dueDate: null,
      });
      setIsEditing(false);
      setCurrentTodo(null);
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error("Failed to save task");
    }
  };

  const handleCancel = () => {
    setModal(false);
    setModalData({
      title: "",
      assignTo: "",
      priority: "",
      tasks: [],
      dueDate: null,
    });
    setIsEditing(false);
    setCurrentTodo(null);
  };

  const handleTaskDelete = (index) => {
    const updatedTasks = modalData.tasks.filter(
      (_, taskIndex) => taskIndex !== index
    );
    setModalData((prevData) => ({
      ...prevData,
      tasks: updatedTasks,
    }));
  };

  const handleStatusChange = async (todo, newStatus) => {
    console.log(todo);
    console.log(newStatus);

    const updatedTodo = { ...todo, status: newStatus };
    // setModalData(updatedTodo);

    try {
      let id = updatedTodo._id;
      await updateTodo(id, updatedTodo);
      toast.success("Status updated successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };
  const handleModalOpen = () => {
    setIsEditing(false);
    setModalData({
      title: "",
      assignTo: "",
      priority: "",
      tasks: [],
      dueDate: null,
    });
    setModal(true);
  };

  const handleEditClick = (todo) => {
    setIsEditing(true);
    // setCurrentTodo(index);
    setModalData(todo); // Ensure todos[index] is defined
    setModal(true);
  };

  const handleDeleteClick = async (id) => {
    const result = await deleteTodo(id);

    if (result) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
    fetchData();
  };

  const handleShareClick = (id) => {
    const linkToCopy = `http://localhost:5173/share/${id}`;

    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        toast.success("Link Copied", {
          position: "top-right",
          autoClose: 2000,
        });
      })
      .catch((err) => {
        toast.error("Failed to copy", {
          position: "top-right",
          autoClose: 2000,
        });
      });
  };

  const filterTodos = (todos, option) => {
    const now = moment();
    switch (option) {
      case "option1":
        return todos.filter((todo) =>
          moment(todo.createdAt).isSame(now, "day")
        );
      case "option2":
        return todos.filter((todo) =>
          moment(todo.createdAt).isSame(now, "week")
        );
      case "option3":
        return todos.filter((todo) =>
          moment(todo.createdAt).isSame(now, "month")
        );
      default:
        return todos;
    }
  };

  const filteredTodos = filterTodos(todos, filterOption);

  const fetchData = async () => {
    let id = localStorage.getItem("userId");
    let res = await getUserTodoById(id);
    if (res.data) {
      console.log(res.data);
      setData(res.data);
      setTodos(res.data);
    }
    return;
  };

  useEffect(() => {
    fetchData();
    fetchUser();
    console.log("data");
    console.log(modalData);
  }, []);

  return (
    <div className={style.section}>
      <div className={style.box1}>
        <h2>Welcome {userName}</h2>
        <p>{formattedDate}</p>
      </div>

      <div className={style.box2}>
        <div className={style.box1}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.3rem",
              cursor: "pointer",
            }}
          >
            <h2>Board</h2>
            <p onClick={() => setAddPeopleModal(true)}>
              <PiUsers />
              Add People
            </p>
          </div>
          <select onChange={(e) => setFilterOption(e.target.value)}>
            <option value="option1">Today</option>
            <option value="option2">This Week</option>
            <option value="option3">This Month</option>
          </select>
        </div>

        {addPeopleModal && (
          <div className={style.modalSection}>
            <div className={style.addPeoplemodalContainer}>
              <h2>Add People to the Board</h2>
              <input
                type="email"
                placeholder="Enter the email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <div className={style.peopleBtnWrap}>
                <button
                  className={style.cancelBtn}
                  onClick={() => setAddPeopleModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={style.saveBtn}
                  onClick={() => handleUpdate()}
                >
                  Add Email
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal && (
          <ConfirmModal
            onClose={() => setConfirmModal(false)}
            email={newEmail}
          />
        )}

        <div className={style.dataSection}>
          <div className={style.dataBox}>
            <div className={style.dataBoxHeader}>
              <p>Backlog</p>
              <CiSquareMinus />
            </div>
            {/* Backlog CARDS */}
            <div className={style.dataCardWrap}>
              {filteredTodos
                .filter((todo) => todo.status === "Backlog")
                .map((todo, index) => (
                  <Card
                    key={todo._id}
                    todo={todo}
                    index={index}
                    dropdown={dropdown}
                    toggleDropdown={toggleDropdown}
                    handleTaskToggleMain={handleTaskToggleMain}
                    handleTaskChange={handleTaskChange}
                    handleStatusChange={handleStatusChange}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}
                    handleShareClick={handleShareClick}
                  />
                ))}
            </div>
          </div>

          <div className={style.dataBox}>
            <div className={style.dataBoxHeader}>
              <p>To do</p>
              <div className={style.iconGrp}>
                <FiPlus onClick={handleModalOpen} />
                <CiSquareMinus />
              </div>
            </div>

            <ToastContainer />
            {/* CARD SECTION START */}
            <div className={style.dataCardWrap}>
              {filteredTodos
                .filter((todo) => todo.status === "To Do")
                .map((todo, index) => (
                  <Card
                    key={todo._id}
                    todo={todo}
                    index={index}
                    dropdown={dropdown}
                    toggleDropdown={toggleDropdown}
                    handleTaskToggleMain={handleTaskToggleMain}
                    handleTaskChange={handleTaskChange}
                    handleStatusChange={handleStatusChange}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}
                    handleShareClick={handleShareClick}
                  />
                ))}
            </div>
          </div>
          {/* CARD SECTION END */}

          <div className={style.dataBox}>
            <div className={style.dataBoxHeader}>
              <p>In progress</p>
              <CiSquareMinus />
            </div>
            {/* IN PROGRESS CARDS */}
            <div className={style.dataCardWrap}>
              {filteredTodos
                .filter((todo) => todo.status === "Progress")
                .map((todo, index) => (
                  <Card
                    key={todo._id}
                    todo={todo}
                    index={index}
                    dropdown={dropdown}
                    toggleDropdown={toggleDropdown}
                    handleTaskToggleMain={handleTaskToggleMain}
                    handleTaskChange={handleTaskChange}
                    handleStatusChange={handleStatusChange}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}
                    handleShareClick={handleShareClick}
                  />
                ))}
            </div>
          </div>

          <div className={style.dataBox}>
            <div className={style.dataBoxHeader}>
              <p>Done</p>
              <CiSquareMinus />
            </div>
            {/* DONE CARDS */}
            <div className={style.dataCardWrap}>
              {filteredTodos
                .filter((todo) => todo.status === "Done")
                .map((todo, index) => (
                  <Card
                    key={todo._id}
                    todo={todo}
                    index={index}
                    dropdown={dropdown}
                    toggleDropdown={toggleDropdown}
                    handleTaskToggleMain={handleTaskToggleMain}
                    handleTaskChange={handleTaskChange}
                    handleStatusChange={handleStatusChange}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}
                    handleShareClick={handleShareClick}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <TodoModal
          modalData={modalData}
          emails={emails}
          modalInputChange={modalInputChange}
          handlePriorityClick={handlePriorityClick}
          handleTaskChange={handleTaskChange}
          handleTaskToggle={handleTaskToggle}
          handleAddTask={handleAddTask}
          setModal={setModal}
          handleCancel={handleCancel}
          handleSave={handleSave}
          isEditing={isEditing}
          handleTaskDelete={handleTaskDelete}
        />
      )}
    </div>
  );
};

export default Board;
