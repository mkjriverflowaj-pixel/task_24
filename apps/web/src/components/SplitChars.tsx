/**
 * Splits a CMS heading into letters (words stay together) so each letter can swing up in 3D one after another (.hero-ch in
 * globals.css). Words marked with ** get the accent class on every letter. The full text stays readable for screen readers.
 */
export function SplitChars({ text, accentClass = '', start = 0 }: { text: string; accentClass?: string; start?: number }) {
  let index = start;
  const plain = text.replace(/\*\*/g, '');
  return (
    <span aria-label={plain}>
      {text.split(/\*\*(.+?)\*\*/g).map((part, partIndex) => {
        const accent = partIndex % 2 === 1;
        return part.split(/(\s+)/).map((word, wordIndex) => {
          if (!word) return null;
          if (/^\s+$/.test(word)) return ' ';
          return (
            <span key={`${partIndex}-${wordIndex}`} className="inline-block whitespace-nowrap" aria-hidden="true">
              {[...word].map((char) => {
                const i = index;
                index += 1;
                return (
                  <span key={i} className={`hero-ch ${accent ? accentClass : ''}`} style={{ '--i': i } as React.CSSProperties}>
                    {char}
                  </span>
                );
              })}
            </span>
          );
        });
      })}
    </span>
  );
}
