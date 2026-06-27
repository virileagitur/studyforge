import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Select, Alert, Spinner } from '../components/ui';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

function MarkdownText({ content }) {
  if (!content) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({node, ...props}) => <span {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function StudyGuidePage() {
  const navigate = useNavigate();
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

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    if (!guide) return;
    setSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      await api.post('/study-guides', {
        topic: guide.topic,
        subject: subject || 'General',
        content: guide
      });
      setSuccessMessage('Study guide saved successfully! You can view it in history.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save study guide.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="AI Study Guide Generator" subtitle="Enter any topic and get a comprehensive study guide instantly" />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

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
          <p className="text-sm text-gray-500">Generating your study guide...</p>
        </div>
      )}

      {/* Fallback for unparseable raw responses */}
      {guide && guide.error && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-red-500 mb-3">AI Response Formatting Issue</h3>
          <p className="text-sm mb-4 text-[#4A4A4A]">
            The AI returned content, but we couldn't parse it into key concepts and terms automatically. You can read the raw response below:
          </p>
          <div className="study-guide-content bg-white rounded-xl p-6 text-sm leading-relaxed border border-gray-150" style={{ whiteSpace: 'pre-wrap' }}>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {guide.raw_content}
            </ReactMarkdown>
          </div>
        </Card>
      )}

      {guide && !guide.error && (
        <div className="space-y-6 animate-fade-in study-guide-content">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBE6DE] pb-4">
            <h2 className="text-2xl font-extrabold text-[#2C2C2C]">
              ## {guide.topic} - Study Guide
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/study-guides/history')}>
                View Saved History
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? 'Saving...' : 'Save Guide'}
              </Button>
            </div>
          </div>

          {/* Estimated Study Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-[#EEF4F2] p-3 rounded-lg border border-[#B0C8C2]/40 w-fit">
            <span className="font-bold">Estimated Study Time:</span>
            <span>{guide.estimated_study_time || '30'} minutes</span>
          </div>

          <div className="grid gap-6">
            {/* Key Concepts */}
            {guide.key_concepts?.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold mb-4 text-[#7A958E]">### Key Concepts</h3>
                <ul className="space-y-4">
                  {guide.key_concepts.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 w-6 h-6 rounded-full bg-[#EEF4F2] text-[#7A958E] text-xs flex items-center justify-center flex-shrink-0 font-bold border border-[#B0C8C2]">{i+1}</span>
                      <div className="flex-1 text-[#2C2C2C]">
                        <MarkdownText content={c} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Important Terms - Table format */}
            {guide.important_terms?.length > 0 && (
              <Card className="overflow-x-auto">
                <h3 className="text-lg font-bold mb-4 text-[#7A958E]">### Important Terms</h3>
                <table className="min-w-full divide-y divide-gray-200 border border-[#EBE6DE] rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-[#EBE6DE]">Term</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Definition</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guide.important_terms.map((t, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-r border-[#EBE6DE]">{t.term}</td>
                        <td className="px-6 py-4 text-sm text-[#4A4A4A]"><MarkdownText content={t.definition} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* Practice Questions */}
            {guide.practice_questions?.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold mb-4 text-[#7A958E]">### Practice Questions</h3>
                <div className="space-y-5">
                  {guide.practice_questions.map((q, i) => (
                    <div key={i} className="border-b border-gray-150 pb-4 last:border-0">
                      <p className="font-semibold text-base text-[#2C2C2C] mb-2">
                        {i+1}. <MarkdownText content={q.question} />
                      </p>
                      <details className="group">
                        <summary className="text-xs text-[#5F8B8B] cursor-pointer hover:text-[#8DA9A0] select-none font-semibold">Show answer</summary>
                        <div className="mt-2 p-3 rounded-lg text-sm bg-[#FBF4E6] text-gray-800 border border-[#E4C07A]/40">
                          Answer: <MarkdownText content={q.answer} />
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
                <h3 className="text-lg font-bold mb-4 text-[#7A958E]">### Recommended Resources</h3>
                <ul className="space-y-2">
                  {guide.recommended_resources.map((r, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-[#8DA9A0] mt-1">•</span>
                      <span className="text-[#2C2C2C]"><MarkdownText content={r} /></span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}

      {!guide && !loading && (
        <div className="text-center py-16">
          <AutoStoriesIcon style={{ fontSize: 64, color: '#D4A857', marginBottom: 16 }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C2C2C' }}>Ready to study?</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Enter any topic above and get key concepts, important terms, practice questions, and resource recommendations.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/study-guides/history')}>
              View Saved History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
