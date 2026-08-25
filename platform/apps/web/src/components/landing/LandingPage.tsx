'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Award, BookOpen, CheckCircle2, QrCode, ShieldCheck, Users } from 'lucide-react';
import { useCategories, useTracks } from '@/lib/hooks';
import { TrackCard } from '@/components/student/TrackCard';
import { CourseCarousel } from '@/components/student/CourseCarousel';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { PublicNav } from './PublicNav';
import { HeroCarousel } from './HeroCarousel';

const STEPS = [
  {
    icon: BookOpen,
    title: 'Choose a course',
    body: 'Browse every published course and read the full syllabus before you commit.',
  },
  {
    icon: Users,
    title: 'Create your account',
    body: 'Sign up free, confirm your email, and enrol in the courses you want.',
  },
  {
    icon: CheckCircle2,
    title: 'Submit your work',
    body: 'Work through the lessons, then submit evidence against each competency.',
  },
  {
    icon: Award,
    title: 'Earn your certificate',
    body: 'A supervisor reviews your capstone. Pass, and your certificate is issued.',
  },
];

export function LandingPage() {
  const { data: tracks = [], isLoading } = useTracks();
  const { data: categories = [] } = useCategories();

  const rows = useMemo(
    () =>
      categories
        .map((c) => ({ category: c, tracks: tracks.filter((t) => t.category.id === c.id) }))
        .filter((r) => r.tracks.length > 0),
    [categories, tracks],
  );

  const lessonCount = tracks.reduce((sum, t) => sum + t.topicCount, 0);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[36rem] h-[36rem] bg-crimson-500/[0.07] blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.16em] font-bold text-crimson-600 bg-crimson-50 border border-crimson-200 rounded-full px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verifiable certification
            </p>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-navy-950 leading-[1.05] text-balance">
              Learn a real skill.
              <br />
              Prove it with a certificate<span className="text-crimson-600">.</span>
            </h1>

            <p className="mt-5 text-navy-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Dojo Hub Learning Platform runs structured courses in software, hardware and data
              science. Every certificate is reviewed by a supervisor and carries a QR code anyone can
              verify.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">Start learning free</Button>
              </Link>
              <Link href="#courses">
                <Button size="lg" variant="outline">
                  Browse courses
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-navy-400">
              Free to join. You only need an account when you are ready to enrol.
            </p>
          </div>

          <HeroCarousel />
        </div>
      </section>

      {/* ------------------------------------------------------------ stats */}
      <section className="border-y border-black/[0.06] bg-navy-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: tracks.length, label: 'Courses available' },
            { value: lessonCount, label: 'Lessons to work through' },
            { value: categories.length, label: 'Disciplines' },
            { value: '100%', label: 'Supervisor reviewed' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950 tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs text-navy-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- courses */}
      <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 space-y-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            Explore our courses
          </h2>
          <p className="text-navy-500 mt-1.5">
            Read the full syllabus before you sign up — you only need an account to enrol.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-navy-400">No courses have been published yet. Check back shortly.</p>
        ) : (
          rows.map((row) => (
            <div key={row.category.id} className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-navy-950 tracking-tight">
                  {row.category.name}
                </h3>
                <p className="text-xs text-navy-500">
                  {row.tracks.length} course{row.tracks.length === 1 ? '' : 's'}
                </p>
              </div>
              <CourseCarousel>
                {row.tracks.map((t) => (
                  <div key={t.id} className="w-[15rem] sm:w-[16rem] shrink-0">
                    <TrackCard track={t} href={`/courses/${t.id}`} />
                  </div>
                ))}
              </CourseCarousel>
            </div>
          ))
        )}
      </section>

      {/* ----------------------------------------------------- how it works */}
      <section id="how-it-works" className="bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-18">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How certification works
          </h2>
          <p className="text-navy-300 mt-1.5 max-w-2xl">
            Four steps from browsing to a certificate someone else can verify.
          </p>

          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="glass-dark rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </span>
                    <span className="text-[12px] font-mono font-bold text-navy-300">
                      STEP {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-3.5 font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-navy-300 leading-relaxed">{step.body}</p>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between glass-dark rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <QrCode className="w-8 h-8 text-crimson-500 shrink-0" />
              <div>
                <p className="font-bold tracking-tight">
                  Every certificate is independently verifiable
                </p>
                <p className="text-sm text-navy-300 mt-0.5">
                  Employers scan the QR code and confirm it instantly — no account needed.
                </p>
              </div>
            </div>
            <Link href="/register" className="shrink-0">
              <Button size="lg">Create your free account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="max-w-sm">
            <p className="font-extrabold tracking-tight text-navy-950">
              DOJO <span className="text-crimson-600">HUB</span>{' '}
              <span className="text-navy-400 font-bold">LEARNING PLATFORM</span>
            </p>
            <p className="mt-2 text-xs text-navy-500 leading-relaxed">
              Structured certification tracks with supervisor-reviewed capstones and verifiable
              credentials.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 mb-2.5">
                Platform
              </p>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="#courses" className="text-navy-600 hover:text-crimson-600">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-navy-600 hover:text-crimson-600">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 mb-2.5">
                Account
              </p>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="/login" className="text-navy-600 hover:text-crimson-600">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-navy-600 hover:text-crimson-600">
                    Create account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 pt-4 border-t border-black/[0.06] text-[12px] text-navy-400">
          © {new Date().getFullYear()} Dojo Hub (SMC). Every certificate carries a QR code that
          anyone can verify.
        </p>
      </footer>
    </div>
  );
}
