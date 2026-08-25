import { CheckCircle2, Clock, User } from "lucide-react";

type ClientCardData = {
  id: string;
  name: string;
  consentGiven: boolean;
  photos: Array<{ url: string }>;
  _count: { tryOnSessions: number };
  tryOnSessions: Array<{ resultUrl: string | null }>;
};

export function ClientCard({ client }: { client: ClientCardData }) {
  const portrait = client.photos[0]?.url;
  const lastLook = client.tryOnSessions[0]?.resultUrl;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-editorial transition-transform duration-300 hover:-translate-y-1.5">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portrait}
            alt={client.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="bg-grain flex h-full w-full items-center justify-center gradient-magenta-coral">
            <User className="size-8 text-white/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <span
          className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md"
          title={client.consentGiven ? "Consent confirmed" : "Awaiting consent"}
        >
          {client.consentGiven ? (
            <CheckCircle2 className="size-3" />
          ) : (
            <Clock className="size-3" />
          )}
          {client.consentGiven ? "Consented" : "Pending"}
        </span>

        {lastLook && (
          <div
            className="absolute top-3 left-3 size-11 overflow-hidden rounded-xl border-2 border-white/70 shadow-editorial"
            title="Last generated look"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lastLook} alt="Last generated look" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-heading text-lg text-white">{client.name}</p>
          <p className="text-xs text-white/75">
            {client._count.tryOnSessions} look{client._count.tryOnSessions === 1 ? "" : "s"} generated
          </p>
        </div>
      </div>
    </div>
  );
}
