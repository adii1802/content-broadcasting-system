const Content = require('../models/content');

exports.uploadContent = async (data) => {
  const newContent = await Content.createContent({
    title: data.title,
    description: data.description,
    subject: data.subject,
    file_url: data.file_url,
    file_type: data.file_type,
    file_size: data.file_size,
    uploaded_by: data.uploaded_by,
    start_time: data.start_time || null,
    end_time: data.end_time || null,
    rotation_duration: data.rotation_duration || null,
  });
  return newContent;
};

exports.getMyContent = async (teacherId) => {
  return await Content.getContentByTeacher(teacherId);
};

exports.getAllContent = async (status) => {
  return await Content.getAllContent(status);
};

exports.approveContent = async (id, principalId) => {
  const content = await Content.getContentById(id);
  if (!content) {
    const error = new Error('Content not found');
    error.statusCode = 404;
    throw error;
  }
  return await Content.updateContentStatus(id, 'approved', principalId, null);
};

exports.rejectContent = async (id, reason) => {
  const content = await Content.getContentById(id);
  if (!content) {
    const error = new Error('Content not found');
    error.statusCode = 404;
    throw error;
  }
  return await Content.updateContentStatus(id, 'rejected', null, reason);
};
