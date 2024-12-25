import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }
        return res.json({ userData:{
            name: user.name,
            isAccountVerified: user.isAccountVerified,
        }, success: true });
        
    } catch (error) {
        return res.json({ message: error.message, success: false });
    }
};