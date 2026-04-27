const contentService = require('../services/contentService');
const { success, error } = require('../utils/response');

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'File is required', 400);
    }
    
    // Validate other fields
    const { title, subject, description, start_time, end_time, rotation_duration } = req.body;
    if (!title || !subject) {
      return error(res, 'Title and subject are required', 400);
    }

    const data = {
      title,
      description,
      subject,
      file_url: `/uploads/${req.file.filename}`,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      uploaded_by: req.user.id,
      start_time: start_time || null,
      end_time: end_time || null,
      rotation_duration: rotation_duration || null,
    };

    const newContent = await contentService.uploadContent(data);
    return success(res, newContent, 'Content uploaded successfully', 201);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

exports.getMyContent = async (req, res) => {
  try {
    const content = await contentService.getMyContent(req.user.id);
    return success(res, content, 'Teacher content fetched successfully', 200);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

exports.getAllContent = async (req, res) => {
  try {
    const { status } = req.query;
    const content = await contentService.getAllContent(status);
    return success(res, content, 'All content fetched successfully', 200);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

exports.getPendingContent = async (req, res) => {
  try {
    const content = await contentService.getAllContent('pending');
    return success(res, content, 'Pending content fetched successfully', 200);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContent = await contentService.approveContent(id, req.user.id);
    return success(res, updatedContent, 'Content approved successfully', 200);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return error(res, 'Rejection reason is required', 400);
    }

    const updatedContent = await contentService.rejectContent(id, reason);
    return success(res, updatedContent, 'Content rejected successfully', 200);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

const schedulingService = require('../services/schedulingService');

exports.getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query;

    const result = await schedulingService.getActiveContent(teacherId, subject);

    if (result.error || result.empty) {
      return res.status(200).json({ message: "No content available" });
    }

    return res.status(200).json({
      teacher_id: teacherId,
      live_content: result.liveContent
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
