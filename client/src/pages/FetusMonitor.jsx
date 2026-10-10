import React, { useState, useRef } from 'react';
import { UploadCloud, Activity, AlertCircle, FileText, CheckCircle } from 'lucide-react';

const FetusMonitor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/trimister-api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Failed to connect to the AI service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] font-heading font-semibold text-blue-800 m-0">Fetus Monitor (AI Diagnostics)</h1>
        <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Upload ultrasound imagery for AI-assisted analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Upload Section */}
        <div className="card flex flex-col p-6">
          <h2 className="text-[18px] font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <UploadCloud size={20} className="text-pink-500" />
            Upload Ultrasound
          </h2>

          {!previewUrl ? (
            <div 
              className="border-2 border-dashed border-ink-200 hover:border-blue-500 bg-ink-50 hover:bg-blue-50/50 transition-colors rounded-card p-10 flex flex-col items-center justify-center text-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-[16px] font-semibold text-blue-800 mb-1">Click or drag image here</h3>
              <p className="text-[13px] text-ink-600">Supports JPG, PNG, DICOM (converted)</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="relative rounded-card overflow-hidden border border-ink-200 bg-black aspect-video flex items-center justify-center">
                <img src={previewUrl} alt="Ultrasound Preview" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  className="btn btn-outline flex-1" 
                  onClick={clearForm}
                  disabled={isAnalyzing}
                >
                  Clear
                </button>
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Analyzing...
                    </span>
                  ) : 'Analyze Image'}
                </button>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Results Section */}
        <div className="card flex flex-col p-6 min-h-[300px]">
          <h2 className="text-[18px] font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-pink-500" />
            Analysis Results
          </h2>

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <Activity className="absolute inset-0 m-auto text-blue-600" size={24} />
              </div>
              <h3 className="text-[16px] font-semibold text-blue-800 mb-1">Processing Image</h3>
              <p className="text-[13px] text-ink-600">Our AI model is analyzing the ultrasound to detect standard fetal planes and anomalies...</p>
            </div>
          )}

          {error && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-50 rounded-card border border-red-100">
              <AlertCircle size={32} className="text-red-500 mb-3" />
              <h3 className="text-[16px] font-semibold text-red-700 mb-1">Analysis Error</h3>
              <p className="text-[13px] text-red-600">{error}</p>
            </div>
          )}

          {!isAnalyzing && !result && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-ink-100 text-ink-400 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} />
              </div>
              <p className="text-[14px] text-ink-600">Upload an ultrasound image and click "Analyze" to see AI diagnostics results here.</p>
            </div>
          )}

          {!isAnalyzing && result && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {(() => {
                const resString = typeof result === 'string' ? result.toLowerCase() : JSON.stringify(result).toLowerCase();
                let statusText = 'Unknown / Requires Manual Review';
                let isHealthy = null;
                
                if (resString.includes('healthy') || resString.includes('normal') || resString.includes('no anomaly') || resString.includes('benign')) {
                  statusText = 'Healthy';
                  isHealthy = true;
                } else if (resString.includes('abnormal') || resString.includes('unhealthy') || resString.includes('anomaly') || resString.includes('disease') || resString.includes('risk')) {
                  statusText = 'Not Healthy / Potential Anomaly';
                  isHealthy = false;
                }

                return (
                  <div className={`p-5 border rounded-card flex flex-col items-center justify-center gap-2 text-center ${
                    isHealthy === true ? 'bg-green-50 border-green-200' : 
                    isHealthy === false ? 'bg-red-50 border-red-200' : 
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    {isHealthy === true ? (
                      <CheckCircle className="text-green-600 mb-1" size={32} />
                    ) : isHealthy === false ? (
                      <AlertCircle className="text-red-600 mb-1" size={32} />
                    ) : (
                      <Activity className="text-yellow-600 mb-1" size={32} />
                    )}
                    
                    <h3 className={`text-[20px] font-bold ${
                      isHealthy === true ? 'text-green-800' : 
                      isHealthy === false ? 'text-red-800' : 
                      'text-yellow-800'
                    }`}>
                      Diagnosis: {statusText}
                    </h3>
                    <p className={`text-[13px] ${
                      isHealthy === true ? 'text-green-700' : 
                      isHealthy === false ? 'text-red-700' : 
                      'text-yellow-700'
                    }`}>
                      {isHealthy === true 
                        ? 'The AI model successfully processed the image and did not detect any significant anomalies.' 
                        : isHealthy === false
                        ? 'The AI model detected potential anomalies. Immediate review by a specialist is recommended.'
                        : 'The AI model successfully processed the image, but the output could not be automatically classified. Please review the raw data below.'}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FetusMonitor;
