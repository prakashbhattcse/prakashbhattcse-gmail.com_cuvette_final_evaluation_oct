import React, { useState } from "react";
import style from "./Board.module.css";
import { MdDelete } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";

const TodoModal = ({
  emails,
  modalData,
  modalInputChange,
  handlePriorityClick,
  handleTaskChange,
  handleTaskToggle,
  handleAddTask,
  handleCancel,
  handleSave,
  handleTaskDelete,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAssignToChange = (event, email) => {
    event.preventDefault();
    modalInputChange({
      target: {
        name: "assignTo",
        value: email,
      },
    });
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={style.modalSection}>
      <div className={style.modal}>
        <div className={style.title}>
          Title <span className={style.red}>*</span>
          <input
            type="text"
            name="title"
            placeholder="Enter Task Title"
            onChange={modalInputChange}
            value={modalData.title}
          />
        </div>

        <div className={style.chipsLabel}>
          <label>
            Select Priority <span className={style.red}>*</span>{" "}
          </label>
          <div className={style.chipsGrp}>
            <button
              className={`${style.chip} ${
                modalData?.priority === "high"
                  ? `${style.active} ${style.high}`
                  : ""
              }`}
              style={{ backgroundColor: "#FBB7B3", color: "red" }}
              onClick={() => handlePriorityClick("high")}
            >
              HIGH
            </button>
            <button
              className={`${style.chip} ${
                modalData?.priority === "moderate"
                  ? `${style.active} ${style.moderate}`
                  : ""
              }`}
              style={{ backgroundColor: "#FFF1D1", color: "#D49000" }}
              onClick={() => handlePriorityClick("moderate")}
            >
              MODERATE
            </button>
            <button
              className={`${style.chip} ${
                modalData?.priority === "low"
                  ? `${style.active} ${style.low}`
                  : ""
              }`}
              style={{ backgroundColor: "#E1F3E1", color: "#478049" }}
              onClick={() => handlePriorityClick("low")}
            >
              LOW
            </button>
          </div>
        </div>

        <div className={style.spaceBtwn}>
          <label htmlFor="assignTo">Assign To</label>
          <div className={style.customDropdown}>
            <div className={style.dropdownButton}>
              <button>{modalData.assignTo || "Select an assignee"}</button>
              <FiChevronDown
                onClick={toggleDropdown}
                style={{ width: "3rem" }}
              />
            </div>

            {isDropdownOpen && (
              <div className={style.dropdownMenu}>
                {emails.map((email, index) => (
                  <div key={index} className={style.dropdownItem}>
                    <span
                      style={{
                        display: "flex",
                        gap: "1.2rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#FFEBEB",
                          borderRadius: "50%",
                          height: "30px",
                          width: "30px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {email.slice(0, 2).toUpperCase()}
                      </span>
                      <span>{email}</span>
                    </span>
                    <button
                      onClick={(event) => handleAssignToChange(event, email)}
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ minHeight: "13rem" }}>
          <p style={{ fontSize: "1rem" }}>
            Checklist({modalData.tasks.filter((task) => task.completed).length}/
            {modalData.tasks.length} ) <span className={style.red}>*</span>
          </p>

          <div className={style.checboxWrap}>
            {modalData.tasks.map((task, index) => (
              <div key={index} className={style.taskBorder}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleTaskToggle(index)}
                />
                <input
                  type="text"
                  style={{ width: "90%" }}
                  value={task.text}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                  id={style.taskInput}
                  placeholder="Add a Task"
                />
                <MdDelete
                  onClick={() => handleTaskDelete(index)}
                  style={{ color: "red" }}
                />
              </div>
            ))}
          </div>
          <button onClick={handleAddTask} className={style.addBtn}>
            + Add New
          </button>
        </div>

        <div className={style.modalBtnGrp}>
          <input
            type="date"
            name="dueDate"
            id="dueDate"
            placeholder="Due Date"
            value={modalData.dueDate || ""}
            onChange={modalInputChange}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button className={style.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
            <button className={style.saveBtn} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoModal;
