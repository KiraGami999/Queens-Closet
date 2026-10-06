import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GradientBlob } from "@/components/decor/blobs";
import { ScribbleLine } from "@/components/decor/blobs";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { ProcessShowcase } from "@/components/marketing/process-showcase";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { TiltCard } from "@/components/motion/tilt-card";
import { WordRotator } from "@/components/motion/word-rotator";
import { Button } from "@/components/ui/button";

const stats = [
  { value: 3, suffix: "", label: "Considered steps from sketch to finished look" },
  { value: 100, suffix: "%", label: "Client photos stay private to your studio" },
  { value: null, display: "24/7", label: "Your AI atelier, always open" },
] as const;

const heroWords = ["imagination.", "the runway.", "couture.", "your muse."] as const;

const lookbook = [
  { name: "Regent Belted Jacket", image: "/catalogue/regent-belted-jacket.jpg" },
  { name: "Noir Edit", image: "/catalogue/noir-edit-lookbook.jpg" },
  { name: "Solene Denim Culottes", image: "/catalogue/solene-denim-culottes.jpg" },
  { name: "Layered Silver Chain", image: "/catalogue/layered-silver-chain.jpg" },
  { name: "Sculptural Ruffle Boots", image: "/catalogue/sculptural-ruffle-boots.jpg" },
  { name: "Bamboo Silver Hoops", image: "/catalogue/bamboo-silver-hoops.jpg" },
  { name: "Leather Baker Boy Cap", image: "/catalogue/leather-baker-boy-cap.jpg" },
];

const closetPreview = [
  {
    name: "Regent Belted Jacket",
    meta: "Outerwear · Black",
    image: "/catalogue/regent-belted-jacket.jpg",
  },
  {
    name: "Solene Denim Culottes",
    meta: "Bottom · Charcoal",
    image: "/catalogue/solene-denim-culottes.jpg",
  },
  {
    name: "Sculptural Ruffle Boots",
    meta: "Footwear · Black",
    image: "/catalogue/sculptural-ruffle-boots.jpg",
  },
  {
    name: "Leather Baker Boy Cap",
    meta: "Accessory · Black",
    image: "/catalogue/leather-baker-boy-cap.jpg",
  },
];

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-0 -z-10">
        <GradientBlob variant="purple" className="top-[-6rem] left-[-8rem] size-[28rem]" />
        <GradientBlob variant="coral" className="top-40 right-[-10rem] size-[24rem] opacity-30" />
      </div>

      <ScrollProgress />
      <SiteHeader />

      {/* HERO */}
      <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pt-4 pb-18 sm:px-10 sm:pt-6 sm:pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[color:var(--qc-magenta)] uppercase">
            <Sparkles className="size-3.5" />
            Virtual Fashion Studio
          </div>

          <h1 className="font-heading text-[2.8rem] leading-[1.02] tracking-tight sm:text-6xl">
            WHERE FASHION
            <br />
            <span className="text-gradient-purple-magenta italic">meets </span>
            <WordRotator words={heroWords} className="text-gradient-purple-magenta pr-2 italic" />
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Upload a design. Choose your model. Let AI bring the look to life.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Button
              size="lg"
              render={<Link href="/register" />}
              className="h-12 gap-2 rounded-full gradient-purple-magenta px-6 text-base text-primary-foreground shadow-editorial transition-transform hover:-translate-y-0.5 hover:opacity-95"
            >
              Create a Look
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/login" />}
              className="h-12 rounded-full border-border bg-card px-6 text-base hover:-translate-y-0.5 hover:bg-card"
            >
              Explore the Closet
            </Button>
          </div>

          <ScribbleLine className="mt-10 hidden sm:block" />

          <dl className="mt-10 grid grid-cols-1 gap-5 border-t border-border/70 pt-8 sm:grid-cols-3 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-heading text-3xl">
                  {stat.value === null ? (
                    stat.display
                  ) : (
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  )}
                </dt>
                <dd className="mt-1 text-[11px] leading-snug text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Reveal delay={0.1} className="lg:justify-self-end">
          <HeroVisual />
        </Reveal>
      </section>

      {/* LOOKBOOK MARQUEE */}
      <section aria-label="Noir Edit lookbook" className="border-t border-border/70 py-8 sm:py-10">
        <Marquee durationSeconds={50}>
          {lookbook.map((item) => (
            <figure
              key={item.name}
              className="group relative h-44 w-32 shrink-0 overflow-hidden rounded-2xl border border-border/70 shadow-editorial sm:h-56 sm:w-40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 text-[11px] font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.name}
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </section>

      {/* PROCESS */}
      <section id="studio" className="relative border-t border-border/70 bg-card/40 py-18 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-10">
          <Reveal className="mb-12 max-w-xl">
            <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">
              The Process
            </p>
            <h2 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
              YOUR STYLE.{" "}
              <span className="text-gradient-purple-magenta italic">Reimagined.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Three considered steps between a sketch and a finished editorial
              image — no photoshoot, no studio hire, no compromise on taste.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ProcessShowcase />
          </Reveal>
        </div>
      </section>

      {/* CLOSET PREVIEW */}
      <section id="closet" className="relative py-18 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-10">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">
                The Closet
              </p>
              <h2 className="mt-4 max-w-md font-heading text-4xl leading-tight sm:text-5xl">
                A digital wardrobe with an editor&rsquo;s eye
              </h2>
            </div>
            <Button
              variant="outline"
              render={<Link href="/register" />}
              className="gap-2 rounded-full border-border bg-card"
            >
              View all pieces
              <ArrowRight className="size-4" />
            </Button>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {closetPreview.map((item, index) => (
              <Reveal key={item.name} delay={index * 0.06}>
                <TiltCard className="rounded-3xl">
                <div className="group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-heading text-base leading-tight">{item.name}</p>
                    <p className="mt-1 text-[11px] tracking-wide text-muted-foreground uppercase">
                      {item.meta}
                    </p>
                  </div>
                </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="muses" className="relative px-4 pb-18 sm:px-10 sm:pb-24">
        <Reveal>
          <div className="bg-grain relative mx-auto flex w-full max-w-7xl flex-col items-start gap-5 overflow-hidden rounded-[2rem] gradient-purple-magenta px-5 py-10 sm:gap-6 sm:px-14 sm:py-14">
            <GradientBlob variant="gold" className="top-[-4rem] right-[-4rem] size-64 opacity-30" />
            <p className="text-xs font-medium tracking-[0.2em] text-white/70 uppercase">
              Muses &amp; Clients
            </p>
            <h2 className="max-w-lg font-heading text-4xl leading-tight text-white sm:text-5xl">
              Every client deserves a runway moment.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/80">
              Build a portfolio of muses, then let the AI atelier dress each one
              in your latest collection — in seconds, not studio days.
            </p>
            <Button
              size="lg"
              render={<Link href="/register" />}
              className="mt-2 h-12 gap-2 rounded-full bg-white px-6 text-base text-[color:var(--qc-purple)] shadow-editorial hover:-translate-y-0.5 hover:bg-white/90"
            >
              Open the Studio
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/70 py-8 sm:py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-10 sm:text-left">
          <span className="font-heading text-sm tracking-[0.16em]">QUEENS CLOSET</span>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Queens Closet. Luxury fashion meets creative technology.
          </p>
        </div>
      </footer>
    </main>
  );
}
