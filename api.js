export default function handler(req, res) {
    // Track tool usage
    const { tool, action } = req.body;
    
    // Log to console (replace with database later)
    console.log(`Tool: ${tool}, Action: ${action}, Time: ${new Date()}`);
    
    res.status(200).json({ success: true });
}