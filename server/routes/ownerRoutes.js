import express from "express";
import { 
    addCar, 
    changeRoleToOwner, 
    deleteCar, 
    getDashboardData, 
    getOwnerCars, 
    toggleCarAvailability, 
    updateCar, 
    updateUserImage,
    getAllUsers,
    changeUserRole,
    deleteUser
} from "../controllers/ownerController.js";
import { protect, adminProtect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner);
ownerRouter.post("/add-car", protect, upload.single("image"), addCar);
ownerRouter.put("/update-car/:carId", protect, upload.single("image"), updateCar);
ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);
ownerRouter.get("/dashboard", protect, adminProtect, getDashboardData);
ownerRouter.post("/update-image", protect, upload.single("image"), updateUserImage);

// User Management Routes for Admins
ownerRouter.get("/users", protect, adminProtect, getAllUsers);
ownerRouter.post("/change-user-role", protect, adminProtect, changeUserRole);
ownerRouter.post("/delete-user", protect, adminProtect, deleteUser);

export default ownerRouter;
