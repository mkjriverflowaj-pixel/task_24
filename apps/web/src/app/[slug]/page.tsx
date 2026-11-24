import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeading } from '@/components/PageHeading';
import { Rich } from '@/components/Rich';
import { getLegalPage, getLegalPages } from '@/lib/strapi';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await getLegalPages();
  return pages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getLegalPage((await params).slug);
  return page ? { title: page.title } : {};
}

/**
 * Legal text is stored as simple markup: "### " starts a heading, lines starting with "- " form a bullet list,
 * and **double asterisks** make text bold. Plain short lines without end punctuation also count as headings.
 */
const isHeading = (block: string) =>
  block.startsWith('### ') || (block.length < 70 && !/[.:;,]$/.test(block) && !block.includes('\n') && !block.startsWith('- '));
const isList = (block: string) => block.split('\n').every((line) => line.startsWith('- '));

export default async function LegalPage({ params }: Props) {
  const page = await getLegalPage((await params).slug);
  if (!page) notFound();

  const blocks = page.content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return (
    <>
      <PageHeading crumbs={[{ label: 'Home', href: '/' }, { label: page.title }]} />
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <h1 className="text-3xl font-medium text-navy-950 sm:text-4xl">{page.title}</h1>
          <div className="mt-6 space-y-5 text-[17px] leading-relaxed text-muted">
            {blocks.map((block, index) => {
              if (isHeading(block)) return <h2 key={index} className="pt-1 text-base font-bold"><Rich text={block.replace(/^### /, '')} /></h2>;
              if (isList(block)) {
                return (
                  <ul key={index} className="list-disc space-y-1.5 pl-5">
                    {block.split('\n').map((line) => (
                      <li key={line}><Rich text={line.slice(2)} /></li>
                    ))}
                  </ul>
                );
              }
              return <p key={index} className="whitespace-pre-line"><Rich text={block} /></p>;
            })}
          </div>
        </div>
      </section>
    </>
  );
}
