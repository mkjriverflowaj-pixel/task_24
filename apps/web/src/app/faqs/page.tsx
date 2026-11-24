import type { Metadata } from 'next';
import { FaqAccordion } from '@/components/FaqAccordion';
import { PageHeading } from '@/components/PageHeading';
import { getFaqs } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Answers to common questions about the Safonix app, rewards and redeeming points.',
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <>
      <PageHeading title="Frequently Asked Questions" crumbs={[{ label: 'Home', href: '/' }, { label: 'FAQs' }]} />
      <section className="py-16">
        <div className="container-page max-w-5xl">
          <FaqAccordion items={faqs.map((faq) => ({ id: faq.documentId, question: faq.question, answer: faq.answer, tag: faq.tag, icon: faq.icon }))} />
          <p className="mt-7 text-[14.5px] text-muted">Thank you for choosing Safonix. We are dedicated to making your experience as smooth as possible!</p>
        </div>
      </section>
    </>
  );
}
