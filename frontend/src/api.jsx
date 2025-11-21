const handleUpload = async () => {
    // ... (FormData 준비)
    
    try {
      const response = await axios.post(
        // ⚠️ 중요: FastAPI 서버의 주소와 포트를 정확하게 지정
        'http://localhost:8000/upload-image/', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // ... (성공 처리)
      
    } catch (error) {
      // ... (에러 처리)
    }
};