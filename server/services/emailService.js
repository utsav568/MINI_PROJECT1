import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST || "smtp.ethereal.email";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
        transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
        console.log("📧 Real SMTP Transporter initialized with:", user);
    } else {
        // Fallback: Create test ethereal account or mock transport for seamless development
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log("📧 Ethereal Test Email Account created for development preview:", testAccount.user);
        } catch (err) {
            // Safe JSON fallback logger transport
            transporter = {
                sendMail: async (mailOptions) => {
                    console.log("📬 [Simulated Email Delivery]", {
                        to: mailOptions.to,
                        subject: mailOptions.subject,
                        timestamp: new Date().toISOString()
                    });
                    return { messageId: `msg_${Date.now()}` };
                }
            };
        }
    }

    return transporter;
};

// Send New Booking Notification to Customer and Admin
export const sendNewBookingEmails = async ({ booking, car, user, adminEmail }) => {
    try {
        const mailer = await getTransporter();
        const fromAddress = process.env.SMTP_FROM || '"CarRental Fleet" <no-reply@carrental.com>';
        const targetAdmin = adminEmail || process.env.ADMIN_EMAIL || "admin@carrental.com";

        const carName = `${car.brand} ${car.model} (${car.year})`;
        const pickupStr = new Date(booking.pickupDate).toLocaleDateString();
        const returnStr = new Date(booking.returnDate).toLocaleDateString();
        const bookingId = booking._id.toString().slice(-6).toUpperCase();

        // 1. Email to Customer
        const customerMailOptions = {
            from: fromAddress,
            to: user.email,
            subject: `🚘 Booking Confirmation #${bookingId} - ${carName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px; background-color: #ffffff;">
                    <div style="background-color: #2563eb; padding: 18px; border-radius: 12px; text-align: center; color: #ffffff;">
                        <h2 style="margin: 0; font-size: 22px;">Booking Confirmation</h2>
                        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Reservation ID: #${bookingId}</p>
                    </div>

                    <div style="padding: 20px 0;">
                        <p>Hi <strong>${user.name || 'Valued Customer'}</strong>,</p>
                        <p>Thank you for choosing CarRental. Your vehicle reservation has been successfully placed and is currently <strong>${booking.status.toUpperCase()}</strong>.</p>
                        
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0;">
                            <h3 style="margin-top: 0; color: #1e293b;">Vehicle & Reservation Details</h3>
                            <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8; font-size: 14px;">
                                <li><strong>Vehicle:</strong> ${carName}</li>
                                <li><strong>Category:</strong> ${car.category || 'Luxury'}</li>
                                <li><strong>Pick-up Date:</strong> ${pickupStr}</li>
                                <li><strong>Return Date:</strong> ${returnStr}</li>
                                <li><strong>Duration:</strong> ${booking.days} Day(s)</li>
                                <li><strong>Delivery Type:</strong> ${booking.deliveryOption === 'delivery' ? 'Doorstep Delivery' : 'Self Pickup from Hub'}</li>
                                <li><strong>Location:</strong> ${booking.deliveryAddress || car.hubAddress || car.location}</li>
                                <li><strong>Contact Phone:</strong> ${booking.customerPhone}</li>
                                <li><strong>Total Paid:</strong> $${booking.price} (${booking.paymentStatus.toUpperCase()})</li>
                            </ul>
                        </div>

                        <p style="font-size: 13px; color: #64748b;">
                            Our fleet team will coordinate vehicle handover accordingly. If you selected Doorstep Delivery, our driver will contact you at <strong>${booking.customerPhone}</strong> prior to arrival.
                        </p>
                    </div>

                    <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 12px; color: #94a3b8;">
                        © 2026 CarRental Platform Inc. • Instant Concierge & Support: support@carrental.com
                    </div>
                </div>
            `
        };

        // 2. Email to Admin
        const adminMailOptions = {
            from: fromAddress,
            to: targetAdmin,
            subject: `🚨 [NEW BOOKING] #${bookingId} - ${carName} by ${user.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1; background-color: #ffffff;">
                    <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff;">
                        <h2 style="margin: 0; font-size: 20px;">⚡ New Customer Booking Alert</h2>
                        <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Reservation #${bookingId}</p>
                    </div>

                    <div style="padding: 16px 0; font-size: 14px;">
                        <p><strong>Customer Name:</strong> ${user.name} (${user.email})</p>
                        <p><strong>Customer Mobile:</strong> <a href="tel:${booking.customerPhone}">${booking.customerPhone}</a></p>
                        <p><strong>Reserved Car:</strong> ${carName}</p>
                        <p><strong>Dates:</strong> ${pickupStr} to ${returnStr} (${booking.days} days)</p>
                        <p><strong>Delivery Option:</strong> ${booking.deliveryOption === 'delivery' ? 'Doorstep Delivery' : 'Self Pickup'}</p>
                        <p><strong>Address:</strong> ${booking.deliveryAddress || car.hubAddress || car.location}</p>
                        <p><strong>Revenue:</strong> $${booking.price} (${booking.paymentStatus})</p>
                    </div>

                    <div style="margin-top: 16px; text-align: center;">
                        <p style="font-size: 12px; color: #64748b;">Open the Admin Booking Dashboard to approve, assign a driver, or dispatch the vehicle.</p>
                    </div>
                </div>
            `
        };

        const resCust = await mailer.sendMail(customerMailOptions);
        const resAdmin = await mailer.sendMail(adminMailOptions);

        console.log(`✉️ Booking confirmation emails sent for #${bookingId}. Customer msg: ${resCust?.messageId || 'ok'}, Admin msg: ${resAdmin?.messageId || 'ok'}`);
        return { success: true };

    } catch (err) {
        console.error("sendNewBookingEmails error:", err.message);
        return { success: false, error: err.message };
    }
};

// Send Status Change Notification to Customer
export const sendStatusChangeEmail = async ({ booking, car, user, newStatus, reason = "" }) => {
    try {
        const mailer = await getTransporter();
        const fromAddress = process.env.SMTP_FROM || '"CarRental Fleet" <no-reply@carrental.com>';

        const carName = `${car.brand} ${car.model}`;
        const bookingId = booking._id.toString().slice(-6).toUpperCase();

        const statusColor = 
            newStatus === "confirmed" ? "#10b981" :
            newStatus === "rejected" ? "#ef4444" :
            newStatus === "completed" ? "#3b82f6" : "#64748b";

        const mailOptions = {
            from: fromAddress,
            to: user.email,
            subject: `📢 Booking #${bookingId} Status Update: ${newStatus.toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; background-color: #ffffff; border-radius: 12px;">
                    <div style="background-color: ${statusColor}; padding: 16px; border-radius: 8px; text-align: center; color: #ffffff;">
                        <h2 style="margin: 0; font-size: 20px;">Booking Status Updated</h2>
                        <p style="margin: 4px 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">Current Status: ${newStatus}</p>
                    </div>

                    <div style="padding: 20px 0; font-size: 14px; line-height: 1.6;">
                        <p>Hi <strong>${user.name || 'Customer'}</strong>,</p>
                        <p>Your reservation for <strong>${carName}</strong> (ID: #${bookingId}) has been updated to <strong>${newStatus.toUpperCase()}</strong>.</p>
                        ${reason ? `<p style="padding: 10px; background-color: #f1f5f9; border-radius: 6px;"><strong>Note from host:</strong> ${reason}</p>` : ''}
                        
                        <p>You can check the live tracking and full receipt in your <a href="http://localhost:5173/my-bookings" style="color: #2563eb; font-weight: bold;">Customer Bookings Dashboard</a>.</p>
                    </div>

                    <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
                        © 2026 CarRental Platform Inc.
                    </div>
                </div>
            `
        };

        const res = await mailer.sendMail(mailOptions);
        console.log(`✉️ Status change email sent to ${user.email} for #${bookingId} (${newStatus})`);
        return { success: true };

    } catch (err) {
        console.error("sendStatusChangeEmail error:", err.message);
        return { success: false, error: err.message };
    }
};
