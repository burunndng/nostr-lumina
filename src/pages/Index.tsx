import * as React from 'react';
import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import {
  ListIcon,
  SearchIcon,
  ZapIcon,
  ShieldIcon,
  UsersIcon,
  ArrowRightIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginArea } from '@/components/auth/LoginArea';
import { useNsfwOptIn } from '@/components/curation/NsfwOptInDialog';
import { Badge } from '@/components/ui/badge';

export function Index() {
  useSeoMeta({
    title: 'Kur4tex | Curation Lists for Nostr',
    description:
      'Discover and curate content on Nostr. Public lists, premium collections, Lightning payments. No gatekeepers.',
  });

  const { NsfwOptInDialogComponent } = useNsfwOptIn();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <NsfwOptInDialogComponent />
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ListIcon className="size-6 text-primary" />
            <span className="font-bold text-xl">Kur4tex</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/lists"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Browse
            </Link>
            <Link
              to="/following"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Following
            </Link>
            <Link
              to="/curate"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Curate
            </Link>
            <LoginArea />
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              NSFW-friendly • Lightning-native • No gatekeepers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Curation Lists for{" "}
              <span className="text-primary">Nostr</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Discover vetted content curated by people you trust. Create
              public lists, premium collections, or private bookmarks. Powered
              by Lightning.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row justify-center">
              <Button size="lg" asChild>
                <Link to="/lists">
                  <SearchIcon className="size-4 mr-2" />
                  Browse Lists
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/curate">
                  <ListIcon className="size-4 mr-2" />
                  Start Curating
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-12">
              Why Kur4tex?
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<ZapIcon className="size-6" />}
                title="Lightning Native"
                description="Monetize your curation with instant Bitcoin payments. No payment processor middlemen."
              />
              <FeatureCard
                icon={<ShieldIcon className="size-6" />}
                title="No Gatekeepers"
                description="Your lists live on Nostr relays. No content policy deplatforming. NSFW is a first-class category."
              />
              <FeatureCard
                icon={<UsersIcon className="size-6" />}
                title="Web of Trust"
                description="Discover lists from curators followed by people you trust. Quality signals, not algorithms."
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-4">
              Curate Anything
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              Articles, books, videos, people, research — or create your own
              categories. NIP-51 makes it extensible.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'Articles',
                'Books',
                'Videos',
                'Podcasts',
                'Research',
                'People',
                'Tools',
                'Adult',
              ].map((category) => (
                <Badge key={category} variant="secondary" className="px-4 py-1">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to start curating?</h2>
            <p className="text-primary-foreground/80 mb-8">
              Join the curators building the open web of trusted content.
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-primary"
            >
              <Link to="/curate">
                Create Your First List
                <ArrowRightIcon className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ListIcon className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Kur4tex — Curation Lists for Nostr
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://github.com/burunndng/nostr-lumina"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://shakespeare.diy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Vibed with Shakespeare
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default Index;
