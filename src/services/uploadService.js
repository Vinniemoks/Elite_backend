const { uploadToS3, deleteFromS3 } = require('../config/aws-s3');

class UploadService {
  async uploadImage(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit.');
    }

    return await uploadToS3(file, 'images');
  }

  async uploadVideo(file) {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only MP4, WebM, and QuickTime are allowed.');
    }

    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit.');
    }

    return await uploadToS3(file, 'videos');
  }

  async uploadDocument(file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only PDF and DOC files are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit.');
    }

    return await uploadToS3(file, 'documents');
  }

  async deleteFile(fileUrl) {
    return await deleteFromS3(fileUrl);
  }
}

module.exports = new UploadService();
