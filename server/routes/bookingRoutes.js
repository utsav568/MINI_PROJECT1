import express from 'express';
import { 
    cancelBooking,
    changeBookingStatus, 
    checkAvailabilityOfCar, 
    createBooking, 
    getCarReservedDates,
    getOwnerBookings, 
    getUserBookings,
    updateDeliveryStatus 
} from '../controllers/bookingController.js';
import { protect, adminProtect } from '../middleware/auth.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar);
bookingRouter.get('/car-reserved-dates/:carId', getCarReservedDates);
bookingRouter.post('/create', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.post('/cancel', protect, cancelBooking);
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.post('/change-status', protect, changeBookingStatus);
bookingRouter.post('/update-delivery-status', protect, updateDeliveryStatus);

export default bookingRouter;