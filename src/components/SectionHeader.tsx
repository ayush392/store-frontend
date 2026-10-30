type Props = {
  title: string;
  // Top-level tab pages (Customers, Stores) use their section title as the
  // page heading.
  as?: 'h1' | 'h2';
};

// Card section title. The list filters that used to sit here did nothing, so
// they were removed until filtering is built.
export const SectionHeader = ({ title, as: Heading = 'h2' }: Props) => {
  return (
    <div className="border-b border-line px-4 py-3.5">
      <Heading className="text-lg font-semibold text-fg">{title}</Heading>
    </div>
  );
};
