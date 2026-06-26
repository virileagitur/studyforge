import React, { useState } from 'react';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Select, Alert, Spinner } from '../components/ui';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SearchIcon from '@mui/icons-material/Search';

export default function StudyGuidePage() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return setError('Please enter a topic.');
    setLoading(true);
    setGuide(null);
    setError('');
    try {
      const res = await api.post('/ai/study-guide', { topic, subject });
      setGuide(res.data.guide);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate study guide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="AI Study Guide Generator" subtitle="Enter any topic and get a comprehensive study guide instantly" />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Topic (e.g. Photosynthesis, The Cold War, Quadratic Equations)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="flex-1"
            required
          />
          <Select value={subject} onChange={e => setSubject(e.target.value)} className="sm:w-40">
            <option value="">Any subject</option>
            {['Biology', 'Chemistry', 'Physics', 'Math', 'History', 'English', 'Geography', 'Computer Science'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Button type="submit" disabled={loading} icon={AutoStoriesIcon}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: '#4A4A4A' }}>Generating your study guide...</p>
        </div>
      )}

      {guide && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
            Study Guide: {guide.topic}
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Key Concepts */}
            {guide.key_concepts?.length > 0 && (
              <Card>
                <h3 className="text-base font-semibold mb-4" style={{ color: '#F97316' }}>Key Concepts</h3>
                <ul className="space-y-2">
                  {guide.key_concepts.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center flex-shrink-0 font-semibold">{i+1}</span>
                      <span style={{ color: '#1A1A1A' }}>{c}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Important Terms */}
            {guide.important_terms?.length > 0 && (
              <Card>
                <h3 className="text-base font-semibold mb-4" style={{ color: '#F97316' }}>Important Terms</h3>
                <div className="space-y-3">
                  {guide.important_terms.map((t, i) => (
                    <div key={i} className="border-b border-gray-100 pb-2 last:border-0">
                      <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{t.term}</p>
                      <p className="text-sm" style={{ color: '#4A4A4A' }}>{t.definition}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Practice Questions */}
          {guide.practice_questions?.length > 0 && (
            <Card>
              <h3 className="text-base font-semibold mb-4" style={{ color: '#F97316' }}>Practice Questions</h3>
              <div className="space-y-4">
                {guide.practice_questions.map((q, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="font-medium text-sm mb-2" style={{ color: '#1A1A1A' }}>{i+1}. {q.question}</p>
                    <details>
                      <summary className="text-xs text-orange-500 cursor-pointer hover:text-orange-600 select-none font-medium">Show answer</summary>
                      <div className="mt-2 p-3 rounded-lg text-sm" style={{ background: '#FEF3C7', color: '#1A1A1A' }}>
                        {q.answer}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommended Resources */}
          {guide.recommended_resources?.length > 0 && (
            <Card>
              <h3 className="text-base font-semibold mb-4" style={{ color: '#F97316' }}>Recommended Resources</h3>
              <ul className="space-y-2">
                {guide.recommended_resources.map((r, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span style={{ color: '#1A1A1A' }}>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {!guide && !loading && (
        <div className="text-center py-16">
          <AutoStoriesIcon style={{ fontSize: 64, color: '#FACC15', marginBottom: 16 }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>Ready to study?</h3>
          <p className="text-sm" style={{ color: '#4A4A4A' }}>
            Enter any topic above and get key concepts, important terms, 10 practice questions, and resource recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
