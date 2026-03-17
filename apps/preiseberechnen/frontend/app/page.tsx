import { Button } from "./components/Button";

export default function Home() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-10">
      <section className="flex flex-col gap-8 sm:gap-10 lg:gap-12 ">
        <div className="max-w-3xl">
          <h1 className="text-[2.1rem] leading-[1.05] sm:text-[2.6rem] sm:leading-[1.05] lg:text-[3.4rem] lg:leading-[1.03] tracking-[-0.04em] font-semibold">
            Kosten kennen, bevor
            <br className="hidden sm:block" />
            sie entstehen.
          </h1>
        </div>

        <div className="max-w-xl text-[0.98rem] sm:text-[1.02rem] leading-relaxed text-[rgba(255,255,227,0.8)]">
          Anwaltsgebühren, Notarkosten, Websitepreise – wir bringen Transparenz
          in die Themen, bei denen die meisten einfach zu viel bezahlen.
          Kostenlos, anonym, in unter einer Minute.
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <Button>
            Zur Übersicht
          </Button>
          <span className="text-xs sm:text-[0.8rem] text-[rgba(255,255,227,0.7)]">
            Direkt zu allen Rechnern
          </span>
        </div>
      </section>
    </main>
  );
}
