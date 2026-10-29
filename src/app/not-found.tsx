import { Empty } from "@/components/Empty";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
      <Empty title="That page is not here" action={{ href: "/", label: "Back to Today's Signal" }}>
        The link may be out of date, or the story has rolled out of the current digest.
      </Empty>
    </div>
  );
}
