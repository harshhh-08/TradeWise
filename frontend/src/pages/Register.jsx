import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';

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
      toast.success('Account provisioned with $100,000 cash.');
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message || 'Registration failed.');
      toast.error(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Logo to="/" size="sm" showSubtitle />
        <div>
          <h2 className="text-xl font-bold tracking-tight text-(--color-text-primary)">
            Create Account
          </h2>
          <p className="text-xs text-(--color-text-muted) font-mono mt-0.5">
            Starting balance: $100,000.00 USD (Virtual)
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded bg-(--color-error-subtle) border border-(--color-error)/30 text-(--color-error) text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          type="text"
          placeholder="e.g. Alex Morgan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-3.5 h-3.5" />}
          autoComplete="name"
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="trader@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-3.5 h-3.5" />}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-3.5 h-3.5" />}
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-3.5 h-3.5" />}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Provision Account
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-(--color-text-muted)">
        Existing account?{' '}
        <Link
          to="/login"
          className="font-semibold text-(--color-brand) hover:underline"
        >
          Sign in to Terminal
        </Link>
      </div>
    </div>
  );
}
