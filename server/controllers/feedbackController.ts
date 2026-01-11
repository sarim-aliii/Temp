import { Request, Response } from 'express';
import Feedback from '../models/Feedback'; 
import { sendEmail } from '../utils/emailService';
import { feedbackSchema } from '../validators';

// Submit Feedback (User)
export const submitFeedback = async (req: Request, res: Response) => {
    if (!req.user) {
         res.status(401).json({ message: 'Not authorized' });
         return;
    }

    try {
        const { type, message } = await feedbackSchema.parseAsync(req.body);

        // 1. Save to Database
        await Feedback.create({
            user: req.user._id,
            type,
            message,
            status: 'new'
        });

        // 2. Send Email (Keep existing logic)
        const emailContent = `
            <div style="font-family: sans-serif; color: #333;">
                <h2 style="color: #ef4444;">Blurchats Feedback</h2>
                <p><strong>User:</strong> ${req.user.name} (${req.user.email})</p>
                <hr />
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="background-color: #f3f4f6; padding: 10px;">
                    ${message.replace(/\n/g, '<br>')}
                </blockquote>
            </div>
        `;

        // Non-blocking email send
        sendEmail({
            to: process.env.EMAIL_USER || '',
            subject: `[Feedback] ${type} - ${req.user.name}`,
            html: emailContent
        }).catch(err => console.error("Failed to send feedback email", err));

        res.status(200).json({ message: 'Feedback sent successfully' });
    } catch (error: any) {
        if (error.name === 'ZodError') {
             res.status(400).json({ message: error.errors[0].message });
             return;
        }
        res.status(500).json({ message: 'Failed to save feedback' });
    }
};

// Get All Feedback (Admin)
export const getAllFeedback = async (req: Request, res: Response) => {
    try {
        const feedback = await Feedback.find()
            .populate('user', 'name email avatar') // Get user details
            .sort({ createdAt: -1 }); // Newest first
        
        res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};