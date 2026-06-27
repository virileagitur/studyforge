import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button, Input, Select, Alert } from '../components/ui';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SCHOOL_LEVELS = ['Middle School', 'High School', 'Undergraduate', 'Graduate', 'PhD', 'Self-learner', 'Professional'];
const STUDY_TIMES = ['Morning (6am–12pm)', 'Afternoon (12pm–6pm)', 'Evening (6pm–10pm)', 'Night (10pm–2am)', 'Varies'];
const GOALS = [
  'Get better grades',
  'Prepare for exams / board exams',
  'Learn new skills for my career',
  'Explore a personal interest',
  'Stay organized and on track',
  'Improve reading speed and retention',
];
const SUBJECTS = ['Mathematics', 'Science', 'History', 'Literature', 'Programming', 'Languages', 'Economics', 'Psychology', 'Philosophy', 'Art & Design'];

const STEPS = ['Welcome', 'Your Profile', 'Study Habits', 'Goals', 'All Set!'];

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    schoolLevel: '',
    subjects: [],
    studyHoursPerDay: '',
    preferredStudyTime: '',
    emailReminders: true,
    mainGoal: '',
  });

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const toggleSubject = (s) => setForm(f => ({
    ...f,
    subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s]
  }));

  const handleComplete = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/auth/onboarding', form);
      if (refreshUser) await refreshUser();
      const slug = encodeURIComponent(user?.name?.toLowerCase().replace(/\s+/g, '-') || 'user');
      navigate(`/${slug}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save your preferences.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));
  const skip = () => {
    const slug = encodeURIComponent(user?.name?.toLowerCase().replace(/\s+/g, '-') || 'user');
    navigate(`/${slug}/dashboard`);
  };

  const progressPct = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F5F0E8' }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ background: '#EEF4F2' }}>
            <AutoStoriesIcon style={{ color: '#8DA9A0', fontSize: 28 }} />
          </div>
          <h1 className="text-xl font-bold text-[#2C2C2C]">StudyForge Setup</h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? 'text-[#8DA9A0] font-semibold' : ''}>{s}</span>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#8DA9A0] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

          {/* STEP 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF4F2] flex items-center justify-center mx-auto">
                <AutoStoriesIcon style={{ color: '#8DA9A0', fontSize: 36 }} />
              </div>
              <h2 className="text-2xl font-extrabold text-[#2C2C2C]">
                Welcome to StudyForge, {user?.name?.split(' ')[0] || 'Scholar'}!
              </h2>
              <p className="text-[#4A4A4A] leading-relaxed">
                Let's take 2 minutes to personalize your academic co-pilot so it can help you study smarter.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                {[
                  { icon: SchoolIcon, text: 'Personalized flashcards' },
                  { icon: EmojiObjectsIcon, text: 'Smart AI recommendations' },
                  { icon: AccessTimeIcon, text: 'Study schedule tips' },
                  { icon: NotificationsIcon, text: 'Deadline reminders' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F0E8] border border-[#EBE6DE]">
                    <Icon style={{ color: '#8DA9A0', fontSize: 20 }} />
                    <span className="text-sm font-medium text-[#2C2C2C]">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-extrabold text-[#2C2C2C]">Tell us about yourself</h2>
              <p className="text-sm text-gray-500">This helps us tailor your experience.</p>
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={setF('fullName')}
                placeholder="Your full name"
              />
              <Select label="Education Level" value={form.schoolLevel} onChange={setF('schoolLevel')}>
                <option value="">Select your level...</option>
                {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </Select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects you study (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        form.subjects.includes(s)
                          ? 'bg-[#8DA9A0] text-white border-[#7A958E]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#8DA9A0] hover:text-[#8DA9A0]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Study Habits */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-extrabold text-[#2C2C2C]">Your study habits</h2>
              <p className="text-sm text-gray-500">We'll use this to give you smarter tips.</p>
              <Select label="How many hours do you study per day?" value={form.studyHoursPerDay} onChange={setF('studyHoursPerDay')}>
                <option value="">Select hours...</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h} hour{h !== 1 ? 's' : ''}</option>)}
              </Select>
              <Select label="When do you prefer to study?" value={form.preferredStudyTime} onChange={setF('preferredStudyTime')}>
                <option value="">Select time...</option>
                {STUDY_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
              <div className="flex items-center gap-3 p-4 bg-[#FBF4E6] rounded-xl border border-[#E4C07A]/40">
                <input
                  type="checkbox"
                  id="emailReminders"
                  checked={form.emailReminders}
                  onChange={e => setForm(f => ({ ...f, emailReminders: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#D4A857]"
                />
                <label htmlFor="emailReminders" className="text-sm font-medium text-[#2C2C2C]">
                  <NotificationsIcon style={{ fontSize: 16, color: '#D4A857', verticalAlign: 'middle', marginRight: 4 }} />
                  Receive deadline reminders and study tips (optional)
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Goals */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-extrabold text-[#2C2C2C]">What's your main goal?</h2>
              <p className="text-sm text-gray-500">This helps StudyForge focus on what matters most to you.</p>
              <div className="space-y-2">
                {GOALS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, mainGoal: g }))}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                      form.mainGoal === g
                        ? 'bg-[#EEF4F2] border-[#8DA9A0] text-[#2C2C2C]'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#B0C8C2] hover:bg-[#F5F0E8]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {form.mainGoal === g && <CheckCircleIcon style={{ color: '#8DA9A0', fontSize: 18 }} />}
                      {form.mainGoal !== g && <span className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 inline-block flex-shrink-0" />}
                      {g}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: All Set */}
          {step === 4 && (
            <div className="text-center space-y-5 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-[#EEF4F2] flex items-center justify-center mx-auto">
                <CheckCircleIcon style={{ color: '#8DA9A0', fontSize: 48 }} />
              </div>
              <h2 className="text-2xl font-extrabold text-[#2C2C2C]">You're all set!</h2>
              <p className="text-[#4A4A4A] leading-relaxed">
                Your personalized StudyForge experience is ready. Time to start studying smarter!
              </p>
              <div className="p-4 bg-[#FBF4E6] rounded-xl border border-[#E4C07A]/40 text-sm text-left space-y-2">
                <p className="font-bold text-[#C49A47]">Your Setup Summary</p>
                {form.schoolLevel && <p><span className="font-semibold">Level:</span> {form.schoolLevel}</p>}
                {form.studyHoursPerDay && <p><span className="font-semibold">Study Hours:</span> {form.studyHoursPerDay}h/day</p>}
                {form.preferredStudyTime && <p><span className="font-semibold">Preferred Time:</span> {form.preferredStudyTime}</p>}
                {form.mainGoal && <p><span className="font-semibold">Goal:</span> {form.mainGoal}</p>}
                {form.subjects.length > 0 && <p><span className="font-semibold">Subjects:</span> {form.subjects.join(', ')}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && step < 4 && (
              <Button type="button" variant="ghost" onClick={back}>Back</Button>
            )}
            {step < 3 && (
              <Button type="button" variant="primary" className="flex-1" onClick={next}>
                {step === 0 ? "Let's Get Started" : 'Continue'}
              </Button>
            )}
            {step === 3 && (
              <Button type="button" variant="primary" className="flex-1" onClick={next}>
                Continue
              </Button>
            )}
            {step === 4 && (
              <Button type="button" variant="primary" className="flex-1" onClick={handleComplete} disabled={saving}>
                {saving ? 'Setting up...' : 'Go to My Dashboard'}
              </Button>
            )}
            {step < 4 && (
              <Button type="button" variant="ghost" onClick={skip} size="sm">
                Skip
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          You can update these settings anytime in your Profile page.
        </p>
      </div>
    </div>
  );
}
