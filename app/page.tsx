import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GradientBlob } from "@/components/decor/blobs";
import { ScribbleLine } from "@/components/decor/blobs";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "3", label: "Considered steps from sketch to finished look" },
  { value: "100%", label: "Client photos stay private to your studio" },
  { value: "24/7", label: "Your AI atelier, always open" },
];

const steps = [
  {
    index: "01",
    title: "Upload the garment",
    description: "Drop in flats, product shots or fabric studies from your closet.",
  },
  {
    index: "02",
    title: "Choose the muse",
    description: "Pick a client portrait from your model portfolio.",
  },
  {
    index: "03",
    title: "Generate the look",
    description: "AI drapes the piece and returns a campaign-ready frame.",
  },
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
            <span className="text-gradient-purple-magenta italic">meets imagination.</span>
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
                <dt className="font-heading text-3xl">{stat.value}</dt>
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

      {/* PROCESS */}
      <section id="studio" className="relative border-t border-border/70 bg-card/40 py-18 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Reveal>
              <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--qc-magenta)] uppercase">
                The Process
              </p>
              <h2 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
                YOUR STYLE.
                <br />
                <span className="text-gradient-purple-magenta italic">Reimagined.</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                Three considered steps between a sketch and a finished editorial
                image — no photoshoot, no studio hire, no compromise on taste.
              </p>

              <ol className="mt-10 space-y-7">
                {steps.map((step) => (
                  <li key={step.index} className="flex gap-5 border-l border-border/70 pl-5">
                    <span className="font-heading text-sm text-[color:var(--qc-coral)]">
                      {step.index}
                    </span>
                    <div>
                      <p className="font-heading text-lg">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="bg-grain relative overflow-hidden rounded-[1.75rem] shadow-editorial">
                <div
                  className="aspect-[4/3] w-full"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 20%, var(--qc-coral) 0%, transparent 45%), radial-gradient(circle at 80% 30%, var(--qc-gold) 0%, transparent 40%), radial-gradient(circle at 50% 90%, var(--qc-magenta) 0%, transparent 55%), linear-gradient(135deg, var(--qc-purple), var(--qc-magenta))",
                  }}
                />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/25 bg-white/15 px-5 py-4 backdrop-blur-md">
                  <p className="text-[10px] font-medium tracking-[0.2em] text-white/80 uppercase">
                    Now generating
                  </p>
                  <p className="mt-1 font-heading text-lg text-white italic">
                    Creating your look&hellip;
                  </p>
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/25">
                    <div className="h-full w-2/3 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
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
                <div className="group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial transition-transform duration-300 hover:-translate-y-1.5">
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
