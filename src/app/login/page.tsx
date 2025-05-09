
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-background to-secondary/30 p-4">
      <LoginForm />
    </div>
  );
}
