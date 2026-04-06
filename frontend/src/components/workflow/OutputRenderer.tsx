import { colorizeLine } from '@/lib/outputColorizer';

export default function OutputRenderer({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="font-mono text-xs leading-relaxed space-y-0.5">
      {lines.map((line, i) => {
        const { color, weight } = colorizeLine(line);
        return (
          <div
            key={i}
            className={weight === 'bold' ? 'font-semibold' : ''}
            style={{ color }}
          >
            {line || '\u00A0'}
          </div>
        );
      })}
    </div>
  );
}
