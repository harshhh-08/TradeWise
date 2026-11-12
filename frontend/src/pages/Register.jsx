import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Account created! $100,000 virtual cash credited.');
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message || 'Registration failed.');
      toast.error(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Create account
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Get started with $100,000 in virtual trading capital.
        </p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-brand-subtle)] border border-[var(--color-brand)]/20 text-xs text-[var(--color-brand)] font-medium">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>Your account will be credited with $100,000 USD virtual cash instantly.</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-error-subtle)] border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="e.g. Alex Morgan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          required
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account & Start Trading
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-[var(--color-text-muted)]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-[var(--color-brand)] hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
