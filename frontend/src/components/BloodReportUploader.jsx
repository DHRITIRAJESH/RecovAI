import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const BloodReportUploader = ({ patientId, onValuesExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractedValues, setExtractedValues] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleFileSelect = async (selectedFile) => {
    setError(null);
    setExtractedValues(null);

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    await uploadAndExtract(selectedFile);
  };

  const uploadAndExtract = async (fileToUpload) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      if (patientId) {
        formData.append('patient_id', patientId);
      }

      const response = await fetch('http://localhost:5000/api/extract-blood-report', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setExtractedValues({
          ...data.values,
          confidence: data.confidence,
          method: data.method,
          database_updated: data.database_updated
        });
        
        // Notify parent component
        if (onValuesExtracted) {
          onValuesExtracted(data.values);
        }
      } else {
        setError(data.message || data.error || 'Failed to extract values');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (extractedValues && onValuesExtracted) {
      onValuesExtracted(extractedValues);
      // Reset state
      setExtractedValues(null);
      setFile(null);
    }
  };

  const handleValueChange = (field, value) => {
    setExtractedValues(prev => ({
      ...prev,
      [field]: parseFloat(value) || null
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600" />
        Upload Blood Report
      </h3>

      {!extractedValues && (
        <>
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="blood-report-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              disabled={uploading}
            />
            
            <label
              htmlFor="blood-report-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {uploading ? (
                <>
                  <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    Extracting vitals...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few seconds
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-blue-600 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop blood report here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, JPG, PNG (Max 10MB)
                  </p>
                </>
              )}
            </label>
          </div>

          {file && !uploading && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">{file.name}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Extracted Values Display */}
      {extractedValues && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-800">Values Extracted Successfully!</p>
              <p className="text-sm text-green-600">
                Confidence: {extractedValues.confidence}% | Method: {extractedValues.method}
              </p>
              {extractedValues.database_updated && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Patient record updated
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hemoglobin */}
            {extractedValues.hemoglobin !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hemoglobin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={extractedValues.hemoglobin || ''}
                  onChange={(e) => handleValueChange('hemoglobin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Platelets */}
            {extractedValues.platelets !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platelets (x10³/µL)
                </label>
                <input
                  type="number"
                  step="1"
                  value={extractedValues.platelets || ''}
                  onChange={(e) => handleValueChange('platelets', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Creatinine */}
            {extractedValues.creatinine !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creatinine (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={extractedValues.creatinine || ''}
                  onChange={(e) => handleValueChange('creatinine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Albumin */}
            {extractedValues.albumin !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Albumin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={extractedValues.albumin || ''}
                  onChange={(e) => handleValueChange('albumin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleConfirmAndSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Confirm & Save Values
            </button>
            <button
              onClick={() => {
                setExtractedValues(null);
                setFile(null);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodReportUploader;
