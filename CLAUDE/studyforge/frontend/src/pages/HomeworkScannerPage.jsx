import React, { useState, useRef } from 'react';
import api from '../lib/api';
import { PageHeader, Card, Button, Alert, Spinner } from '../components/ui';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';

export default function HomeworkScannerPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return setError('Please upload an image file.');
    }
    setImage(file);
    setExtractedText('');
    setSolution('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!image) return;
    setExtracting(true);
    setError('');
    try {
      // Use Tesseract.js (loaded from CDN or npm) — here we simulate
      // In real app: import Tesseract from 'tesseract.js'; const result = await Tesseract.recognize(image);
      // For this scaffold, we use a placeholder note
      const placeholderText = '[OCR extracted text would appear here when Tesseract.js is configured. For now, you can type or paste the problem text directly below.]';
      setExtractedText(placeholderText);
    } catch {
      setError('OCR extraction failed. Please type the text manually below.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSolve = async () => {
    if (!extractedText.trim()) return setError('Please provide problem text.');
    setLoading(true);
    setSolution('');
    setError('');
    try {
      const res = await api.post('/ai/homework-scan', { extracted_text: extractedText });
      setSolution(res.data.solution);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Homework Scanner"
        subtitle="Upload a photo of your homework and get step-by-step solutions"
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card>
        <h3 className="text-base font-semibold mb-4" style={{ color: '#1A1A1A' }}>Upload Homework Photo</h3>

        <div
          onClick={() => fileRef.current?.click()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-orange-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Homework" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <div>
              <CameraAltIcon style={{ fontSize: 48, color: '#FACC15', marginBottom: 8 }} />
              <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Drop an image here or click to upload</p>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Supports JPG, PNG, HEIC</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />

        {image && (
          <div className="mt-4 flex gap-3">
            <Button onClick={handleExtract} disabled={extracting} icon={SearchIcon} variant="outline" size="sm">
              {extracting ? 'Extracting text...' : 'Extract Text (OCR)'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} icon={UploadFileIcon}>Change Image</Button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-base font-semibold mb-3" style={{ color: '#1A1A1A' }}>Problem Text</h3>
        <p className="text-sm mb-2" style={{ color: '#4A4A4A' }}>
          The extracted text will appear here. You can also type or paste the problem directly.
        </p>
        <textarea
          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-vertical"
          style={{ minHeight: '100px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#1A1A1A' }}
          placeholder="Type or paste the homework problem here..."
          value={extractedText}
          onChange={e => setExtractedText(e.target.value)}
        />
        <div className="mt-3">
          <Button onClick={handleSolve} disabled={loading || !extractedText.trim()} icon={SearchIcon}>
            {loading ? 'Analyzing...' : 'Solve & Explain'}
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="flex flex-col items-center py-8 gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: '#4A4A4A' }}>Analyzing your homework problem...</p>
        </div>
      )}

      {solution && (
        <Card>
          <h3 className="text-base font-semibold mb-4" style={{ color: '#F97316' }}>Solution</h3>
          <div className="text-sm leading-relaxed" style={{ color: '#1A1A1A', whiteSpace: 'pre-wrap' }}>
            {solution}
          </div>
        </Card>
      )}
    </div>
  );
}
