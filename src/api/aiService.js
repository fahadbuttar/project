import axiosClient from './axiosClient.js';

export const aiService = {
  /**
   * Process voice audio query (transcribes and searches inventory)
   * @param {Blob | File} audioFile
   */
  async queryVoice(audioFile) {
    const formData = new FormData();
    // Use proper extension/filename based on type or default to .webm / .wav
    const fileName = audioFile.name || `voice-query-${Date.now()}.webm`;
    formData.append('audio', audioFile, fileName);

    const response = await axiosClient.post('/ai/query', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data?.data || response.data;
  },
};

export default aiService;
