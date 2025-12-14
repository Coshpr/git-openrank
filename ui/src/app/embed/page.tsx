import SvgGenerator from './svg-generator';

export default async function EmbedPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-6xl mx-auto ">
        <SvgGenerator />
      </div>
    </div>
  );
}
