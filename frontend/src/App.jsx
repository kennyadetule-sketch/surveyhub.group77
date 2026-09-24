import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from './components/Button';
import { Navbar } from './components/Navbar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';
import { Card } from './components/Card';
import { Badge } from './components/Badge';
import { Input } from './components/Input';
import { Textarea } from './components/Textarea';
import { StatCard } from './components/StatCard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';
import { surveyService } from './services/surveyService';
import { responseService } from './services/responseService';
import { resultService } from './services/resultService';
import { authService } from './services/authService';
import { questionService } from './services/questionService';

const statusTone = {
  draft: 'slate',
  published: 'green',
  closed: 'amber',
};

const normalizeStatus = (value = 'draft') => String(value ?? 'draft').trim().toLowerCase();
const formatStatus = (value) => {
  const normalized = normalizeStatus(value);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
const getStatusTone = (value) => statusTone[normalizeStatus(value)] || 'slate';
const normalizeVisibility = (value = 'public') => String(value ?? 'public').trim().toLowerCase();

const publicFeatures = [
  { title: 'Easy to Use', text: 'Create polished surveys in minutes with a clean creator experience.' },
  { title: 'Real-Time Results', text: 'Track responses and see summary insights as they come in.' },
  { title: 'Secure & Reliable', text: 'Built for trust, clarity, and dependable feedback collection.' },
];

const questionTypeOptions = [
  'short-text',
  'long-text',
  'multiple-choice',
  'checkbox',
  'yes-no',
  'rating',
];

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      {children}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-lg font-bold text-slate-900">SurveyHub</p>
            <p className="mt-1">Create Surveys. Collect Feedback. Make Better Decisions.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-blue-600">About</Link>
            <Link to="/login" className="hover:text-blue-600">Login</Link>
            <Link to="/register" className="hover:text-blue-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <PublicLayout>
      <main>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">Built for modern teams</span>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Create Surveys. Collect Feedback. Make Better Decisions.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                SurveyHub helps teams gather useful feedback, understand trends, and act with clarity.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
                <Link to="/about">
                  <Button variant="secondary">Learn More</Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-8 text-sm text-slate-500">
                <span>15k+ responses</span>
                <span>4.9/5 rating</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-blue-100/60">
              <div className="rounded-2xl bg-slate-900 p-5 text-white">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm text-slate-300">Course Experience Feedback</span>
                  <Badge tone="green">Published</Badge>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-800 p-3">
                    <p className="text-xs uppercase text-slate-400">Question 1</p>
                    <p className="mt-2 text-sm">How would you rate this course overall?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Excellent', 'Good', 'Average', 'Poor'].map((option) => (
                      <div key={option} className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-3 text-sm text-slate-200">
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Why teams choose SurveyHub</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Everything you need to gather honest feedback</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {publicFeatures.map((feature) => (
                <Card key={feature.title} className="h-full">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">✓</div>
                  <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-slate-600">{feature.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

function AboutPage() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">About SurveyHub</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">A smarter way to collect meaningful feedback.</h1>
          <p className="mt-5 max-w-3xl text-slate-600">
            SurveyHub helps creators design fast, clear, and engaging surveys to understand customer sentiment,
            student response, team wellbeing, and product experience.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">What we do</h2>
              <p className="mt-3 text-slate-600">We give teams a clean and accessible way to create surveys, collect responses, and turn insight into action.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Our mission</h2>
              <p className="mt-3 text-slate-600">To make feedback collection simple, useful, and actionable for every organization.</p>
            </div>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">Our vision</h3>
              <p className="mt-2 text-slate-600">A world where every decision is informed by meaningful feedback.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">Our values</h3>
              <p className="mt-2 text-slate-600">Clarity, trust, accessibility, and continuous improvement.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">How it works</h3>
              <p className="mt-2 text-slate-600">Create a survey, share the public link, and review results in one place.</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/register">
              <Button>Start a survey</Button>
            </Link>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <div className="text-8xl font-black text-blue-600">404</div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-4 text-slate-600">The page you’re looking for doesn’t exist or may have moved.</p>
        <div className="mt-8">
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </main>
    </PublicLayout>
  );
}

function ErrorPage({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">!</div>
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          {onRetry && <Button onClick={onRetry}>Try Again</Button>}
          <Link to="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <Card className="p-8">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Welcome back</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Log in</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={error && !form.email ? 'Email is required' : ''}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={error && !form.password ? 'Password is required' : ''}
            />

            <div className="flex items-center justify-between text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don’t have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">Register</Link>
          </p>
        </Card>
      </main>
    </PublicLayout>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!form.email) nextErrors.email = 'Email is required';
    if (!form.password) nextErrors.password = 'Password is required';
    if (form.password.length < 6) nextErrors.password = 'Use at least 6 characters';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (error) {
      setErrors({ form: error.message || 'Unable to create account.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <Card className="p-8">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Create account</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Register</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="fullName"
              label="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Your name"
              error={errors.fullName}
            />
            <Input
              id="register-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              error={errors.email}
            />

            <div className="relative">
              <Input
                id="register-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create password"
                error={errors.password}
              />
              <button
                type="button"
                className="absolute right-3 top-[42px] text-xs font-medium text-slate-500"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="relative">
              <Input
                id="confirmPassword"
                label="Confirm password"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                error={errors.confirmPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-[42px] text-xs font-medium text-slate-500"
                onClick={() => setShowConfirm((value) => !value)}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>

            {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login</Link>
          </p>
        </Card>
      </main>
    </PublicLayout>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function DashboardPage() {
  const [items, setItems] = useState([]);
  const [responseCountMap, setResponseCountMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        setLoading(true);
        const data = await surveyService.getSurveys();
        const counts = {};

        for (const survey of data) {
          const id = survey.id || survey._id;
          try {
            const responses = await responseService.getResponses(id);
            counts[id] = responses.length;
          } catch (innerError) {
            counts[id] = 0;
          }
        }

        setItems(data);
        setResponseCountMap(counts);
      } catch (err) {
        setError('Unable to load surveys.');
      } finally {
        setLoading(false);
      }
    };

    loadSurveys();
  }, []);

  const filtered = items.filter((survey) => survey.title.toLowerCase().includes(search.toLowerCase()));
  const totalSurveys = items.length;
  const publishedSurveys = items.filter((survey) => normalizeStatus(survey.status) === 'published').length;
  const totalResponses = Object.values(responseCountMap).reduce((sum, count) => sum + Number(count || 0), 0);
  const draftSurveys = items.filter((survey) => normalizeStatus(survey.status) === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h2 className="text-3xl font-bold text-slate-900">Your dashboard</h2>
        </div>
        <Link to="/surveys/create">
          <Button>Create Survey</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Surveys" value={totalSurveys} change="Across all status" accent="blue" />
        <StatCard label="Published" value={publishedSurveys} change="Live surveys" accent="green" />
        <StatCard label="Total Responses" value={totalResponses} change="Collected so far" accent="purple" />
        <StatCard label="Draft Surveys" value={draftSurveys} change="In progress" accent="slate" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Recent Surveys</h3>
          <Input
            id="dashboard-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surveys"
            className="max-w-xs"
          />
        </div>

        {loading ? <LoadingSpinner label="Loading surveys..." /> : null}
        {error ? <ErrorState message={error} onAction={() => window.location.reload()} /> : null}

        {!loading && !error && filtered.length === 0 ? (
          <EmptyState title="No surveys yet" message="Create your first survey to start collecting responses." />
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.slice(0, 5).map((survey) => (
              <div key={survey.id || survey._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-slate-900">{survey.title}</h4>
                    <Badge tone={getStatusTone(survey.status)}>{formatStatus(survey.status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{survey.questions?.length || 0} questions • {responseCountMap[survey.id || survey._id] || 0} responses • {formatDate(survey.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/surveys/${survey.id || survey._id}`}><Button variant="secondary" size="sm">View</Button></Link>
                  <Link to={`/surveys/${survey.id || survey._id}/edit`}><Button variant="secondary" size="sm">Edit</Button></Link>
                  <Link to={`/surveys/${survey.id || survey._id}/results`}><Button variant="secondary" size="sm">Results</Button></Link>
                  <Button variant="danger" size="sm" onClick={() => { const target = survey.id || survey._id; if (target) surveyService.deleteSurvey(target); window.location.reload(); }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function MySurveysPage() {
  const [surveysList, setSurveysList] = useState([]);
  const [responseCountMap, setResponseCountMap] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortValue, setSortValue] = useState('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const handleDeleteSurvey = async (survey) => {
    const surveyId = survey.id || survey._id;
    if (!surveyId) return;

    const confirmed = window.confirm(`Delete "${survey.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    await surveyService.deleteSurvey(surveyId);
    setSurveysList((current) => current.filter((item) => (item.id || item._id) !== surveyId));
    setResponseCountMap((current) => {
      const next = { ...current };
      delete next[surveyId];
      return next;
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await surveyService.getSurveys();
      const counts = {};

      for (const survey of data) {
        const id = survey.id || survey._id;
        try {
          counts[id] = (await responseService.getResponses(id)).length;
        } catch (error) {
          counts[id] = 0;
        }
      }

      setSurveysList(data);
      setResponseCountMap(counts);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let items = [...surveysList];
    if (statusFilter !== 'All') items = items.filter((survey) => normalizeStatus(survey.status) === statusFilter);
    if (search) items = items.filter((survey) => survey.title.toLowerCase().includes(search.toLowerCase()));
    items.sort((a, b) => {
      if (sortValue === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortValue === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return a.title.localeCompare(b.title);
    });
    return items;
  }, [surveysList, statusFilter, search, sortValue]);

  if (loading) return <LoadingSpinner label="Loading surveys..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Overview</p>
          <h2 className="text-3xl font-bold text-slate-900">My Surveys</h2>
        </div>
        <Link to="/surveys/create">
          <Button>Create Survey</Button>
        </Link>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search surveys" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
            <option value="All">All status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
          <select value={sortValue} onChange={(e) => setSortValue(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No surveys match your filters" message="Try a different search or status filter." />
      ) : (
        <div className="grid gap-4">
          {filtered.map((survey) => (
            <Card key={survey.id || survey._id} className="p-0 overflow-hidden">
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-slate-900">{survey.title}</h3>
                    <Badge tone={getStatusTone(survey.status)}>{formatStatus(survey.status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{survey.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>{survey.questions?.length || 0} questions</span>
                    <span>{responseCountMap[survey.id || survey._id] || 0} responses</span>
                    <span>{formatDate(survey.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/surveys/${survey.id || survey._id}`}><Button variant="secondary" size="sm">View</Button></Link>
                  <Link to={`/surveys/${survey.id || survey._id}/edit`}><Button variant="secondary" size="sm">Edit</Button></Link>
                  <Link to={`/surveys/${survey.id || survey._id}/results`}><Button variant="secondary" size="sm">Results</Button></Link>
                  <Link to={`/surveys/${survey.id || survey._id}/responses`}><Button variant="secondary" size="sm">Responses</Button></Link>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteSurvey(survey)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateSurveyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', visibility: 'public', status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const saveDraft = async () => {
    setSaving(true);
    setError('');

    try {
      const created = await surveyService.createSurvey({
        title: form.title,
        description: form.description,
        visibility: normalizeVisibility(form.visibility),
        status: 'draft',
        creatorId: 'u-1',
        questions: [],
      });

      const surveyId = created?.id || created?._id;
      if (!surveyId) {
        setError('Your draft could not be saved right now. Please try again.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'We could not save your draft right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    if (!form.title.trim()) {
      setError('Please add a survey title before continuing.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const created = await surveyService.createSurvey({
        title: form.title,
        description: form.description,
        visibility: normalizeVisibility(form.visibility),
        status: normalizeStatus(form.status),
        creatorId: 'u-1',
        questions: [],
      });

      const surveyId = created?.id || created?._id;
      if (!surveyId) {
        setError('The survey was created, but the app could not continue to the question builder. Please try again.');
        return;
      }

      navigate('/surveys/create/questions', { state: { surveyId } });
    } catch (err) {
      const message = err?.response?.data?.message || 'We could not create your survey right now. Please check your details and try again.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Create survey</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">Survey details</h2>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-blue-600 px-3 py-1.5 font-medium text-white">1. Survey Details</span>
        <span className="rounded-full bg-slate-200 px-3 py-1.5">2. Questions</span>
        <span className="rounded-full bg-slate-200 px-3 py-1.5">3. Review & Publish</span>
      </div>

      <Card>
        <div className="space-y-5">
          <Input
            id="survey-title"
            label="Survey title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Employee engagement survey"
          />
          <Textarea
            id="survey-description"
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Briefly describe what this survey is about."
            rows={5}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Visibility</span>
              <select
                value={normalizeVisibility(form.visibility)}
                onChange={(e) => setForm({ ...form, visibility: normalizeVisibility(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
              <select
                value={normalizeStatus(form.status)}
                onChange={(e) => setForm({ ...form, status: normalizeStatus(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-4">
            <Link to="/dashboard"><Button variant="secondary">Cancel</Button></Link>
            <Button variant="secondary" onClick={saveDraft} disabled={saving}>Save Draft</Button>
            <Button onClick={handleContinue} disabled={saving}>{saving ? 'Creating...' : 'Continue / Add Questions'}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function QuestionBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const surveyId = location.state?.surveyId;

  if (!surveyId) {
    return (
      <ErrorPage
        message="This survey could not be loaded. Please return to the dashboard and create the survey again."
        onRetry={() => navigate('/surveys/create')}
      />
    );
  }

  const [questions, setQuestions] = useState([
    {
      id: 'default-q-1',
      type: 'multiple-choice',
      text: 'How would you rate this course?',
      required: true,
      options: ['Excellent', 'Good', 'Average', 'Poor'],
    },
  ]);

  useEffect(() => {
    if (!surveyId) return;
    const loadSurvey = async () => {
      const survey = await surveyService.getSurvey(surveyId);
      if (survey?.questions?.length) setQuestions(survey.questions);
    };
    loadSurvey();
  }, [surveyId]);

  const updateQuestion = (index, field, value) => {
    setQuestions((current) => current.map((question, i) => i === index ? { ...question, [field]: value } : question));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((current) => current.map((question, i) => {
      if (i !== questionIndex) return question;
      const options = [...(question.options || [])];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  };

  const addOption = (questionIndex) => {
    setQuestions((current) => current.map((question, i) => {
      if (i !== questionIndex) return question;
      const options = question.options || ['Option 1'];
      return { ...question, options: [...options, `Option ${options.length + 1}`] };
    }));
  };

  const removeQuestion = (index) => {
    setQuestions((current) => current.filter((_, i) => i !== index));
  };

  const duplicateQuestion = (index) => {
    setQuestions((current) => {
      const item = current[index];
      return [...current, { ...item, id: `q-${Date.now()}` }];
    });
  };

  const moveQuestion = (index, direction) => {
    setQuestions((current) => {
      const newQuestions = [...current];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newQuestions.length) return current;
      [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
      return newQuestions;
    });
  };

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        id: `q-${Date.now()}`,
        type: 'short-text',
        text: '',
        required: false,
        options: ['Option 1', 'Option 2'],
      },
    ]);
  };

  const saveDraft = async () => {
    if (!surveyId) return;

    try {
      const survey = await surveyService.getSurvey(surveyId);
      const existingQuestions = survey?.questions || [];
      const existingIds = new Set((existingQuestions || []).map((question) => question.id || question._id));
      const nextIds = new Set();

      for (const question of questions) {
        const questionId = question.id || question._id;
        const payload = { questionText: question.text, type: question.type, required: Boolean(question.required), options: question.options || [] };

        if (questionId && existingIds.has(questionId)) {
          await questionService.updateQuestion(questionId, payload);
          nextIds.add(questionId);
        } else {
          const created = await questionService.createQuestion(surveyId, payload);
          nextIds.add(created?.id || created?._id);
        }
      }

      for (const existingQuestion of existingQuestions) {
        const existingId = existingQuestion.id || existingQuestion._id;
        if (existingId && !nextIds.has(existingId)) {
          await questionService.deleteQuestion(existingId);
        }
      }

      await surveyService.updateSurvey(surveyId, { status: 'draft' });
      navigate(`/surveys/${surveyId}`);
    } catch (error) {
      console.error('Unable to save survey draft.', error);
    }
  };

  const continueToPublish = async () => {
    if (!surveyId) return;

    try {
      const survey = await surveyService.getSurvey(surveyId);
      const existingQuestions = survey?.questions || [];
      const existingIds = new Set((existingQuestions || []).map((question) => question.id || question._id));
      const nextIds = new Set();

      for (const question of questions) {
        const questionId = question.id || question._id;
        const payload = { questionText: question.text, type: question.type, required: Boolean(question.required), options: question.options || [] };

        if (questionId && existingIds.has(questionId)) {
          await questionService.updateQuestion(questionId, payload);
          nextIds.add(questionId);
        } else {
          const created = await questionService.createQuestion(surveyId, payload);
          nextIds.add(created?.id || created?._id);
        }
      }

      for (const existingQuestion of existingQuestions) {
        const existingId = existingQuestion.id || existingQuestion._id;
        if (existingId && !nextIds.has(existingId)) {
          await questionService.deleteQuestion(existingId);
        }
      }

      await surveyService.updateSurvey(surveyId, { status: 'published' });
      navigate(`/surveys/${surveyId}`);
    } catch (error) {
      console.error('Unable to publish survey.', error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Question builder</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">Build your survey</h2>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-slate-200 px-3 py-1.5">1. Survey Details</span>
        <span className="rounded-full bg-blue-600 px-3 py-1.5 font-medium text-white">2. Questions</span>
        <span className="rounded-full bg-slate-200 px-3 py-1.5">3. Review & Publish</span>
      </div>

      {questions.length === 0 ? (
        <EmptyState title="No questions yet" message="Add a question to start building your survey." action={<Button onClick={addQuestion}>Add Question</Button>} />
      ) : (
        <div className="space-y-5">
          {questions.map((question, index) => (
            <Card key={question.id} className="p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Question {index + 1}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => moveQuestion(index, -1)}>↑</Button>
                  <Button variant="secondary" size="sm" onClick={() => moveQuestion(index, 1)}>↓</Button>
                  <Button variant="secondary" size="sm" onClick={() => duplicateQuestion(index)}>Duplicate</Button>
                  <Button variant="danger" size="sm" onClick={() => removeQuestion(index)}>Delete</Button>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Question text"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                  placeholder="Type your question here"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">Question type</span>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                    >
                      {questionTypeOptions.map((type) => (
                        <option key={type} value={type}>{type.replace('-', ' ')}</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={question.required || false}
                        onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Required
                    </label>
                  </div>
                </div>

                {(question.type === 'multiple-choice' || question.type === 'checkbox') && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Options</p>
                    {(question.options || []).map((option, optionIndex) => (
                      <div key={`${question.id}-option-${optionIndex}`} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <Button variant="secondary" size="sm" onClick={() => setQuestions((current) => current.map((item, innerIndex) => {
                          if (innerIndex !== index) return item;
                          const nextOptions = (item.options || []).filter((_, i) => i !== optionIndex);
                          return { ...item, options: nextOptions.length ? nextOptions : ['Option 1'] };
                        }))}>Remove</Button>
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => addOption(index)}>Add option</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={addQuestion}>Add Question</Button>
        <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
        <Button variant="secondary" onClick={() => navigate('/surveys/create')}>Back</Button>
        <Button onClick={continueToPublish}>Continue</Button>
      </div>
    </div>
  );
}

function EditSurveyPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await surveyService.getSurvey(id);
      setSurvey(data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading survey..." />;
  if (!survey) return <ErrorState title="Survey not found" message="This survey could not be loaded." />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Edit survey</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">{survey.title}</h2>
        </div>
        <Badge tone={getStatusTone(survey.status)}>{formatStatus(survey.status)}</Badge>
      </div>

      <Card className="space-y-5">
        <Input label="Title" value={survey.title} onChange={(e) => setSurvey({ ...survey, title: e.target.value })} />
        <Textarea label="Description" value={survey.description} onChange={(e) => setSurvey({ ...survey, description: e.target.value })} rows={5} />

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Visibility</span>
            <select value={normalizeVisibility(survey.visibility)} onChange={(e) => setSurvey({ ...survey, visibility: normalizeVisibility(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <select value={normalizeStatus(survey.status)} onChange={(e) => setSurvey({ ...survey, status: normalizeStatus(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Questions</h3>
          {(survey.questions || []).map((question, index) => (
            <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">{index + 1}. {question.text || 'Untitled question'}</p>
              <p className="mt-1 text-sm text-slate-500">{question.type.replace('-', ' ')}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-5">
          <Button onClick={async () => {
            const payload = { ...survey, status: normalizeStatus(survey.status), visibility: normalizeVisibility(survey.visibility) };
            await surveyService.updateSurvey(id, payload);
            navigate(`/surveys/${id}`);
          }}>Save changes</Button>
          <Button variant="secondary" onClick={async () => {
            const nextStatus = normalizeStatus(survey.status) === 'published' ? 'draft' : 'published';
            const updated = { ...survey, status: nextStatus, visibility: normalizeVisibility(survey.visibility) };
            await surveyService.updateSurvey(id, updated);
            setSurvey(updated);
          }}>{normalizeStatus(survey.status) === 'published' ? 'Move to Draft' : 'Publish Survey'}</Button>
          <Link to={`/surveys/${id}`}><Button variant="secondary">Back to details</Button></Link>
        </div>
      </Card>
    </div>
  );
}

function SurveyDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Questions');

  useEffect(() => {
    const loadSurvey = async () => {
      const data = await surveyService.getSurvey(id);
      setSurvey(data);
      setLoading(false);
    };
    loadSurvey();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading survey details..." />;
  if (!survey) return <ErrorState title="Survey not found" message="This survey is unavailable." />;

  const tabs = ['Questions', 'Responses', 'Results'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Survey details</p>
          <h2 className="text-3xl font-bold text-slate-900">{survey.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/surveys/${id}/edit`}><Button variant="secondary" size="sm">Edit</Button></Link>
          <Button variant="secondary" size="sm" onClick={async () => {
            const nextStatus = normalizeStatus(survey.status) === 'published' ? 'draft' : 'published';
            const updated = { ...survey, status: nextStatus, visibility: normalizeVisibility(survey.visibility) };
            await surveyService.updateSurvey(id, updated);
            setSurvey(updated);
            navigate(`/surveys/${id}`);
          }}>{normalizeStatus(survey.status) === 'published' ? 'Move to Draft' : 'Publish Survey'}</Button>
          <Button variant="danger" size="sm" onClick={async () => {
            const confirmed = window.confirm(`Delete "${survey.title}"? This action cannot be undone.`);
            if (!confirmed) return;
            await surveyService.deleteSurvey(id);
            navigate('/dashboard');
          }}>Delete</Button>
          <Link to={`/survey/${id}`}><Button size="sm">View Public Survey</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Status" value={formatStatus(survey.status)} change="Current state" accent="green" />
        <StatCard label="Questions" value={survey.questions?.length || 0} change="In this survey" accent="blue" />
        <StatCard label="Responses" value={survey.responseCount || 0} change="Submitted" accent="purple" />
      </div>

      <Card>
        <p className="text-slate-700">{survey.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          <span>Created: {formatDate(survey.createdAt)}</span>
          <span>Visibility: {survey.visibility || 'Public'}</span>
          <span>Share link: /survey/{survey.id || survey._id}</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm">Copy link</Button>
        </div>
      </Card>

      <Card>
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-xl px-3 py-2 text-sm font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Questions' && (
          <div className="space-y-4">
            {(survey.questions || []).map((question, index) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{index + 1}. {question.text}</p>
                <div className="mt-2 text-sm text-slate-500">
                  <span>{question.type.replace('-', ' ')}</span>
                  {question.required && <span className="ml-3 text-red-500">Required</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Responses' && (
          <div className="space-y-3">
            {(!survey.responseCount || survey.responseCount === 0) ? (
              <EmptyState title="No responses yet" message="This survey has not received submissions yet." />
            ) : (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-medium text-slate-900">Responses available</p>
                  <p className="text-sm text-slate-500">{survey.responseCount} total submissions recorded.</p>
                </div>
                <Link to={`/surveys/${id}/responses`}><Button variant="secondary" size="sm">View response</Button></Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Results' && (
          <div>
            <p className="text-sm text-slate-600">Summary coming soon with analytics for your survey.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function PublicSurveyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await surveyService.getSurvey(id, true);
      setSurvey(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleInputChange = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleCheckChange = (questionId, option, checked) => {
    setAnswers((current) => {
      const selections = current[questionId] || [];
      return {
        ...current,
        [questionId]: checked ? [...selections, option] : selections.filter((item) => item !== option),
      };
    });
  };

  const validate = () => {
    for (const question of survey.questions || []) {
      if (question.required) {
        const value = answers[question.id];
        if ((Array.isArray(value) && value.length === 0) || value === undefined || value === '') {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!survey || !validate()) {
      setError('Please answer all required questions before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await responseService.submitResponse(id, answers);
      navigate(`/survey/${id}/success`);
    } catch (err) {
      setError('Unable to submit your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading survey..." />;
  if (!survey) return <ErrorPage message="This survey could not be found." />;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">S</div>
          <div>
            <p className="text-xl font-bold text-slate-900">SurveyHub</p>
          </div>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <Badge tone={getStatusTone(survey.status)}>{formatStatus(survey.status)}</Badge>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{survey.title}</h1>
            <p className="mt-3 text-slate-600">{survey.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {(survey.questions || []).map((question, index) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 p-5">
                <label className="block text-lg font-medium text-slate-900">
                  {index + 1}. {question.text}
                  {question.required && <span className="ml-2 text-red-500">*</span>}
                </label>

                {question.type === 'short-text' && (
                  <div className="mt-4">
                    <Input value={answers[question.id] || ''} onChange={(e) => handleInputChange(question.id, e.target.value)} placeholder="Your answer" />
                  </div>
                )}

                {question.type === 'long-text' && (
                  <div className="mt-4">
                    <Textarea value={answers[question.id] || ''} onChange={(e) => handleInputChange(question.id, e.target.value)} rows={5} placeholder="Write your response here" />
                  </div>
                )}

                {question.type === 'multiple-choice' && (
                  <div className="mt-4 space-y-3">
                    {question.options?.map((option) => (
                      <label key={option} className="flex items-center gap-3 text-slate-700">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleInputChange(question.id, option)}
                          className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'checkbox' && (
                  <div className="mt-4 space-y-3">
                    {question.options?.map((option) => (
                      <label key={option} className="flex items-center gap-3 text-slate-700">
                        <input
                          type="checkbox"
                          checked={(answers[question.id] || []).includes(option)}
                          onChange={(e) => handleCheckChange(question.id, option, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'yes-no' && (
                  <div className="mt-4 flex gap-6">
                    {['Yes', 'No'].map((option) => (
                      <label key={option} className="flex items-center gap-3 text-slate-700">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleInputChange(question.id, option)}
                          className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'rating' && (
                  <div className="mt-4 flex gap-2 text-2xl text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={answers[question.id] >= star ? 'text-amber-400' : 'text-slate-300'}
                        onClick={() => handleInputChange(question.id, star)}
                        aria-label={`Rate ${star} out of 5`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Response'}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function SubmissionSuccessPage() {
  const { id } = useParams();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="max-w-lg p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600">✓</div>
        <h1 className="text-3xl font-bold text-slate-900">Thank You!</h1>
        <p className="mt-4 text-slate-600">Your response has been submitted successfully.</p>
        <div className="mt-8">
          <Link to={`/survey/${id}`}>
            <Button variant="secondary">Back to survey</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function ResponsesPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const surveyData = await surveyService.getSurvey(id);
      const responseData = await responseService.getResponses(id);
      setSurvey(surveyData);
      setItems(responseData);
    };
    load();
  }, [id]);

  const filtered = items.filter((entry) => {
    const entryId = entry.id || entry._id || '';
    const matchesSearch = String(entryId).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || (filter === 'Anonymous' && entry.respondent === 'Anonymous');
    return matchesSearch && matchesFilter;
  });

  if (!survey) return <LoadingSpinner label="Loading responses..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Responses</p>
        <h2 className="text-3xl font-bold text-slate-900">{survey.title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total responses" value={items.length} change="Submitted" accent="blue" />
        <StatCard label="Anonymous" value={items.filter((entry) => entry.respondent === 'Anonymous').length} change="No identity" accent="green" />
        <StatCard label="Completion rate" value={`${Math.min(100, Math.round((items.length / Math.max(1, items.length || 1)) * 100))}%`} change="Live data" accent="purple" />
      </div>

      <Card>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search response ID" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
            <option value="All">All</option>
            <option value="Anonymous">Anonymous</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No responses found" message="This survey has no matching submissions yet." />
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <div key={entry.id || entry._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{entry.id || entry._id}</p>
                  <p className="text-sm text-slate-500">{entry.respondent} • {formatDate(entry.createdAt || entry.submittedAt || new Date())}</p>
                </div>
                <Button variant="secondary" size="sm">View response</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ResultsPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [data, setData] = useState({ totalResponses: 0, completionRate: 0, summaries: [] });

  useEffect(() => {
    const load = async () => {
      const surveyData = await surveyService.getSurvey(id);
      const results = await resultService.getResults(id);
      setSurvey(surveyData);
      setData(results);
    };
    load();
  }, [id]);

  if (!survey) return <LoadingSpinner label="Loading results..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Results</p>
        <h2 className="text-3xl font-bold text-slate-900">{survey.title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total responses" value={data.totalResponses} change="Collected" accent="blue" />
        <StatCard label="Completion rate" value={`${data.completionRate}%`} change="Overall" accent="green" />
        <StatCard label="Questions" value={survey.questions?.length || 0} change="Analyzed" accent="purple" />
      </div>

      <div className="space-y-6">
        {data.summaries.map((summary) => (
          <Card key={summary.questionId}>
            <h3 className="text-lg font-semibold text-slate-900">{summary.text}</h3>
            {summary.type === 'short-text' || summary.type === 'long-text' ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
                {summary.results.map((answer) => <li key={answer}>{answer}</li>)}
              </ul>
            ) : (
              <div className="mt-5 space-y-3">
                {Object.entries(summary.results).map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${(value / data.totalResponses) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ fullName: currentUser?.fullName || 'Ava Thompson', email: currentUser?.email || 'ava@surveyhub.com' });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
          {currentUser?.fullName?.slice(0, 2).toUpperCase() || 'AT'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{form.fullName}</h2>
          <p className="text-slate-500">{form.email} • {currentUser?.role || 'Creator'}</p>
        </div>
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-slate-900">Edit profile</h3>
        <div className="mt-5 space-y-5">
          <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Role" value={currentUser?.role || 'Creator'} readOnly />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="New password" type="password" placeholder="••••••••" />
            <Input label="Confirm password" type="password" placeholder="••••••••" />
          </div>
          <div className="pt-3">
            <Button>Update profile</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/survey/:id" element={<PublicSurveyPage />} />
      <Route path="/survey/:id/success" element={<SubmissionSuccessPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
      </Route>

      <Route
        path="/surveys"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MySurveysPage />} />
        <Route path="create" element={<CreateSurveyPage />} />
        <Route path="create/questions" element={<QuestionBuilderPage />} />
        <Route path=":id" element={<SurveyDetailsPage />} />
        <Route path=":id/edit" element={<EditSurveyPage />} />
        <Route path=":id/responses" element={<ResponsesPage />} />
        <Route path=":id/results" element={<ResultsPage />} />
      </Route>

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
