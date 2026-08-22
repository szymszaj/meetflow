import Link from "next/link";
import { authContent } from "@/content/auth";
import { SignInButtons } from "@/components/auth/SignInButtons";

export default function LoginPage() {
  const { login } = authContent;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-indigo-600"
          >
            meetflow
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900">
            {login.heading}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{login.subheading}</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-100">
          <SignInButtons content={login} />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          {login.terms}{" "}
          <Link href="/terms" className="underline hover:text-zinc-600">
            {login.termsLink}
          </Link>{" "}
          i{" "}
          <Link href="/privacy" className="underline hover:text-zinc-600">
            {login.privacyLink}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
