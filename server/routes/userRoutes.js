import express from 'express';
import { 
    getCars, 
    getCarById, 
    getDistinctLocations, 
    getUserData, 
    loginUser, 
    registerUser, 
    updateUserProfile,
    saveCustomerLocation 
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserData);
userRouter.put('/profile', protect, updateUserProfile);
userRouter.post('/save-location', protect, saveCustomerLocation);
userRouter.get('/cars', getCars);
userRouter.get('/cars/:id', getCarById);
userRouter.get('/locations', getDistinctLocations);

export default userRouter;
