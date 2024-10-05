import React, { useState } from 'react';
import styles from "./Settings.module.css";
import { updateUser } from "../../apis/auth";
import { CiUser, CiMail, CiLock } from "react-icons/ci";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


const Settings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        updateEmail: "",
        oldPassword: "",
        newPassword: "",
    });

    const handleFormChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleUpdate = async () => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await updateUser(userId, formData);

            if (response.passwordUpdated) {
                // Logout the user
                localStorage.removeItem("token");
                localStorage.removeItem("name");
                localStorage.removeItem("userId");
                navigate('/');
                // Optionally, redirect to login page or show a message
                toast.info('Password updated successfully. Logging out...', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            } else {
                toast.success('User data updated successfully', {
                    position: 'top-right',
                    autoClose: 1000
                });
            }

        } catch (error) {
            console.error("Update Error:", error);
            if (error.response && error.response.status === 401) {
                toast.error('Incorrect old password. Please try again.', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            } else {
                toast.error('An error occurred. Please try again.', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.container}>
                <h1>Settings</h1>
                <div className={styles.formOutline}>
                    <div className={styles.formFieldOutline}>
                        <CiUser />
                        <input className={styles.input} name="name" value={formData.name} onChange={handleFormChange} type="text" placeholder="Name" />
                    </div>
                    <div className={styles.formFieldOutline}>
                        <CiMail />
                        <input className={styles.input} name="updateEmail" value={formData.updateEmail} onChange={handleFormChange} type="email" placeholder="Update Email" />
                    </div>
                    <div className={styles.formFieldOutline}>
                        <CiLock />
                        <input className={styles.input} name="oldPassword" value={formData.oldPassword} onChange={handleFormChange} type="password" placeholder="Old Password" />
                    </div>
                    <div className={styles.formFieldOutline}>
                        <CiLock />
                        <input className={styles.input} name="newPassword" value={formData.newPassword} onChange={handleFormChange} type="password" placeholder="New Password" />
                    </div>
                    <button onClick={handleUpdate} className={styles.btnBlue}>Update</button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Settings;
