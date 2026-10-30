import { Empty } from "@/components/Empty";
import { editionLabel } from "@/lib/editions/dates";

/** The honest states a past-day page can be in, in plain words. */
export function EditionState({ state, date }: { state: "off" | "error" | "missing" | "empty"; date?: string }) {
  const back = { href: "/", label: "Back to today" };
  const days = { href: "/editions", label: "See other days" };
  switch (state) {
    case "off":
      return (
        <Empty title="Past days are not switched on yet" action={back}>
          Keeping a copy of each day needs a storage connection in the site&rsquo;s settings. Today&rsquo;s Signal works as normal.
        </Empty>
      );
    case "error":
      return (
        <Empty title="Past days could not be loaded just now" action={back}>
          The saved copies are safe. Please try again in a minute.
        </Empty>
      );
    case "empty":
      return (
        <Empty title="The first day will be kept at the next refresh" action={back}>
          SIGNAL keeps a copy of each day in the morning and again in the evening. Come back tomorrow and today will be here.
        </Empty>
      );
    case "missing":
      return (
        <Empty title={date ? `No copy was kept for ${editionLabel(date)}` : "No copy was kept for that day"} action={days}>
          Days are kept from the evening this was switched on, and only on days the site ran.
        </Empty>
      );
  }
}
