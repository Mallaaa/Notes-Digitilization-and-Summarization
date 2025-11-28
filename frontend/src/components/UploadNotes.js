import React, { useState, useRef, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import './Notes.css';

// Backend API URL - adjust based on your environment
const BACKEND_API_URL = 'http://localhost:8080/api/notes';

const UploadNotes = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // Camera State/Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' }
  ];

  const subjects = [
    { value: 'general', label: 'General' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'literature', label: 'Literature' },
    { value: 'technology', label: 'Technology' }
  ];

  const handleFileChange = (file) => {
    if (file) {
      if (!file.type.match('image.*')) {
        setError('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please upload files smaller than 10MB.');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      setResult(null);
      setProgress(0);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  }, []);

  // OCR using Tesseract.js with improved cleaning (KEPT IN FRONTEND)
  const extractTextFromImage = async (file) => {
    setProgressMessage('Initializing OCR engine...');
    
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            setProgress(10 + Math.round(progress * 0.5)); // OCR takes up 10% to 60% of total progress
            setProgressMessage(`Extracting text... ${progress}%`);
          }
        }
      });

      // Configure for better handwriting recognition (PSM 6: Uniform block of text)
      await worker.setParameters({
        tessedit_pageseg_mode: '6', 
        tessedit_ocr_engine_mode: '1', // LSTM only
      });

      setProgressMessage('Processing image...');
      const { data: { text, confidence } } = await worker.recognize(file);
      
      await worker.terminate();

      if (!text || text.trim().length < 5) {
        throw new Error('No text could be extracted from the image. Please try a clearer image with readable text.');
      }

      // Clean up the extracted text to remove OCR artifacts
      const cleanedText = text
          .replace(/(\n\s*){2,}/g, '\n\n') // Reduce multiple newlines to max two
          .replace(/[^\S\r\n]+/g, ' ')     // Condense multiple spaces/tabs
          .replace(/[—_]+/g, ' ')          // Remove common dash/underline artifacts
          .replace(/[•]/g, '*')           // Standardize bullet points
          .trim();
          
      return cleanedText;

    } catch (error) {
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  };

  // UPDATED: Backend API call for summarization
  const generateSummaryWithBackend = async (extractedText, language, subject) => {
    setProgressMessage('Connecting to AI service...');

    try {
      const response = await fetch(`${BACKEND_API_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractedText: extractedText,
          language: language,
          subject: subject
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.summary;
      } else {
        throw new Error(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Backend API Error:', error);
      return `
Summary Generation Failed: 
Could not generate an AI summary due to an error: ${error.message}.

Please ensure the backend server is running on ${BACKEND_API_URL} and check the console for details.
      `.trim();
    }
  };

  // Main processing function
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setResult(null);
    setProgress(0);
    setProgressMessage('Starting processing...');
    
    try {
      // Step 1: Extract text using OCR (10% to 60%)
      setProgress(10);
      const extractedText = await extractTextFromImage(selectedFile);
      setProgress(60);
      
      // Step 2: Generate summary via Backend (60% to 90%)
      setProgress(70);
      const summary = await generateSummaryWithBackend(extractedText, selectedLanguage, selectedSubject);
      setProgress(90);
      
      // Step 3: Display results
      setProgressMessage('Finalizing results...');
      const processingResult = {
        success: true,
        extractedText: extractedText,
        summary: summary,
        filename: selectedFile.name,
        timestamp: new Date().toISOString(),
        language: selectedLanguage,
        subject: selectedSubject
      };
      
      setResult(processingResult);
      setProgress(100);
      
      // Save to history (optional, non-blocking)
      try {
        const history = JSON.parse(localStorage.getItem('processingHistory') || '[]');
        history.unshift({
          id: Date.now(),
          userId: user?.id || 'anonymous',
          filename: selectedFile.name,
          timestamp: new Date().toISOString(),
          extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''),
          summary: summary.substring(0, 500) + (summary.length > 500 ? '...' : ''),
          language: selectedLanguage,
          subject: selectedSubject
        });
        localStorage.setItem('processingHistory', JSON.stringify(history.slice(0, 10))); // Keep last 10
      } catch (storageError) {
        console.warn('Failed to save to history:', storageError);
      }
      
    } catch (err) {
      setError(`Processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  // --- Utility Functions ---

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Text copied to clipboard!'))
      .catch(err => console.error('Failed to copy text:', err));
  };

  const downloadResults = () => {
    if (!result) return;
    
    const content = `NOTES PROCESSING RESULTS

File: ${result.filename}
Processed: ${new Date(result.timestamp).toLocaleString()}
Language: ${result.language}
Subject: ${result.subject}

--- EXTRACTED TEXT ---
${result.extractedText}

--- AI SUMMARY ---
${result.summary}

--- End of Results ---`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-summary-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Camera functions 
  const startCamera = async () => {
    setCameraError('');
    try {
      // Request environment (back-facing) camera first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch (err) {
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `captured-image-${Date.now()}.jpg`, { 
          type: 'image/jpeg' 
        });
        handleFileChange(file);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Handwritten Notes 📝</h2>
        <p>Convert your handwritten notes to digital text and get automated summaries</p>
        
        {/* Backend Status */}
        <div className="api-info">
          <small>
            <span style={{color: 'green', fontWeight: 'bold'}}>
              ✓ Using Spring Boot Backend
            </span>
          </small>
        </div>
        
        {/* Language and Subject Selection */}
        <div className="selection-container">
          <div className="selection-group">
            <label htmlFor="language-select">Summary Language:</label>
            <select 
              id="language-select"
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="selection-dropdown"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="selection-group">
            <label htmlFor="subject-select">Subject Type:</label>
            <select 
              id="subject-select"
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="selection-dropdown"
            >
              {subjects.map(subject => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Camera / Upload Toggle */}
        <div className="camera-toggle">
            {showCamera ? (
                <button type="button" onClick={stopCamera} className="camera-btn stop-btn">
                    Stop Camera 🛑
                </button>
            ) : (
                <button type="button" onClick={startCamera} className="camera-btn">
                    Use Camera to Capture 📸
                </button>
            )}
        </div>
        
        {cameraError && <div className="error-message error-box">{cameraError}</div>}

        {/* Camera Feed */}
        {showCamera && (
            <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline className="video-feed"></video>
                <canvas ref={canvasRef} style={{display: 'none'}}></canvas>
                <button type="button" onClick={captureImage} className="capture-btn">
                    Capture Image
                </button>
            </div>
        )}
        
        {/* File Upload Section */}
        {!showCamera && (
            <div className="upload-options">
            <div 
                className={`file-drop-zone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                type="file"
                id="file-upload"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleInputChange}
                className="file-input"
                />
                <label htmlFor="file-upload" className="file-label">
                <div className="upload-icon">📁</div>
                <p>{selectedFile ? selectedFile.name : 'Choose an image file'}</p>
                <p className="drop-text">or drag and drop files here</p>
                <button type="button" className="browse-btn">Browse Files</button>
                </label>
            </div>
            </div>
        )}
        
        {previewUrl && (
          <div className="preview-container">
            <h3>Preview:</h3>
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
        )}
        
        {error && <div className="error-message error-box">{error}</div>}
        
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isProcessing}
          className="process-btn"
        >
          {isProcessing ? 'Processing...' : `Digitalize & Summarize (${selectedLanguage})`}
        </button>
        
        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>{progressMessage}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p>Overall Progress: {progress}%</p>
          </div>
        )}
        
        {result && (
          <div className="result-container">
            <h3>Results ({result.language.toUpperCase()} - {result.subject.toUpperCase()}):</h3>
            
            <div className="result-section">
              <div className="section-header">
                <h4>Extracted Text ({result.extractedText.length} characters):</h4>
                <button 
                  className="action-btn copy-btn"
                  onClick={() => copyToClipboard(result.extractedText)}
                >
                  Copy Text
                </button>
              </div>
              {/* Use white-space: pre-wrap for preserving formatting from OCR/Gemini */}
              <div className="text-output">{result.extractedText}</div>
            </div>
            
            <div className="result-section">
              <div className="section-header">
                <h4>AI Summary:</h4>
                <button 
                  className="action-btn copy-btn"
                  onClick={() => copyToClipboard(result.summary)}
                >
                  Copy Summary
                </button>
              </div>
              <div className="summary-output">{result.summary}</div>
            </div>
            
            <div className="action-buttons">
              <button 
                className="action-btn download-btn"
                onClick={downloadResults}
              >
                Download Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadNotes; 