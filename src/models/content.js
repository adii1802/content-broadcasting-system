const db = require('../config/db');

exports.createContent = async ({ title, description, subject, file_url, file_type, file_size, uploaded_by, start_time, end_time, rotation_duration }) => {
  const result = await db.query(
    `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, start_time, end_time, rotation_duration, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
    [title, description, subject, file_url, file_type, file_size, uploaded_by, start_time, end_time, rotation_duration]
  );
  return result.rows[0];
};

exports.getContentByTeacher = async (teacherId) => {
  const result = await db.query(
    `SELECT * FROM content WHERE uploaded_by = $1 ORDER BY created_at DESC`,
    [teacherId]
  );
  return result.rows;
};

exports.getAllContent = async (status) => {
  let query = `SELECT * FROM content`;
  const params = [];
  if (status) {
    query += ` WHERE status = $1`;
    params.push(status);
  }
  query += ` ORDER BY created_at DESC`;
  const result = await db.query(query, params);
  return result.rows;
};

exports.getContentById = async (id) => {
  const result = await db.query(`SELECT * FROM content WHERE id = $1`, [id]);
  return result.rows[0];
};

exports.updateContentStatus = async (id, status, approved_by = null, rejection_reason = null) => {
  const approved_at = status === 'approved' ? new Date() : null;
  const result = await db.query(
    `UPDATE content 
     SET status = $1, approved_by = $2, approved_at = $3, rejection_reason = $4 
     WHERE id = $5 RETURNING *`,
    [status, approved_by, approved_at, rejection_reason, id]
  );
  return result.rows[0];
};

exports.getActiveContentForTeacher = async (teacherId, subject) => {
  let query = `
    SELECT * FROM content 
    WHERE uploaded_by = $1 
      AND status = 'approved' 
      AND start_time IS NOT NULL 
      AND end_time IS NOT NULL 
      AND start_time <= NOW() 
      AND end_time >= NOW()
  `;
  const params = [teacherId];
  if (subject) {
    query += ` AND subject = $2`;
    params.push(subject);
  }
  query += ` ORDER BY created_at ASC`;
  const result = await db.query(query, params);
  return result.rows;
};
