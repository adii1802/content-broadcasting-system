const User = require('../models/user');
const Content = require('../models/content');

exports.getActiveContent = async (teacherId, subject = null) => {
  // Check if teacher exists
  const teacher = await User.getUserById(teacherId);
  if (!teacher || teacher.role !== 'teacher') {
    return { error: 'Teacher not found' };
  }

  // Fetch valid, approved active content
  const contents = await Content.getActiveContentForTeacher(teacherId, subject);
  
  if (!contents || contents.length === 0) {
    return { empty: true };
  }

  // Group by subject
  const grouped = contents.reduce((acc, curr) => {
    if (!acc[curr.subject]) acc[curr.subject] = [];
    acc[curr.subject].push(curr);
    return acc;
  }, {});

  const now = new Date();
  const liveContent = [];

  for (const subj in grouped) {
    const items = grouped[subj];
    
    // Determine epoch: earliest start_time in this group
    const epoch = new Date(Math.min(...items.map(i => new Date(i.start_time))));
    
    // Normalize rotation_duration to 5 mins if null
    const normalizedItems = items.map(item => ({
      ...item,
      durationMinutes: item.rotation_duration || 5
    }));

    const totalCycleDuration = normalizedItems.reduce((sum, item) => sum + item.durationMinutes, 0);
    
    if (totalCycleDuration === 0) continue;

    // elapsed time in minutes
    // (now - epoch) returns milliseconds
    const elapsedMinutes = Math.floor((now.getTime() - epoch.getTime()) / (1000 * 60));
    
    // If somehow epoch is in the future (shouldn't happen due to DB query 'start_time <= NOW()'), fallback to 0
    const safeElapsedMinutes = Math.max(0, elapsedMinutes);
    
    const position = safeElapsedMinutes % totalCycleDuration;

    let accumulated = 0;
    let activeItem = null;

    for (const item of normalizedItems) {
      if (position >= accumulated && position < accumulated + item.durationMinutes) {
        activeItem = item;
        break;
      }
      accumulated += item.durationMinutes;
    }

    if (activeItem) {
      const { durationMinutes, ...itemData } = activeItem;
      liveContent.push({
        subject: subj,
        active: itemData
      });
    }
  }

  if (liveContent.length === 0) {
    return { empty: true };
  }

  return { liveContent };
};
